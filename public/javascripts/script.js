/* Authors: Toby Ho, Rob Faraj */

/* Global Variables!!! Ack! */
var frequencies = [],
    wordToElement = {},
    summary = {},
    windowSize = 75,
    sinceID = null,
    running = false,
    query = null,
    wordToIdx = {},
    canvasWidth,
    canvasHeight,
    stop = false,
    prevData = [],
    data = [],
    refreshPeriod = 3000,
    animateDuration = refreshPeriod / 2,
    refreshTrendsPeriod = 5 * 60000,
    showBirds = true
    
function trackEvent(category, action, label, value){
	var event = ['_trackEvent', category, action, label, value]
	if (typeof _gaq != 'undefined'){
		_gaq.push(event)
	}
}
    
function bubble(){
    return d3.layout.pack()
        .sort(null)
        .size([canvasWidth, canvasHeight])
}
    
function fitCanvas(){        
    canvasHeight = $(window).height() - $('#top').height() - 60
    canvasWidth = $(window).width()
    d3.select('#visualization svg')
        .attr('width', canvasWidth)
        .attr('height', canvasHeight)
}

function blueBirdFly(num){
  if(showBirds){
    for (var i = 0; i < num; i++){
        setTimeout(function(){
            var $bird = $('<img class="bird" src="images/blue-bird.png"/>')
                .prependTo('body')
                .css({top: ($(window).height() * Math.random()) + 'px'})
                .click(function(){
                    // Can you guess?
                    trackEvent('Rick roll')
                    window.open('http://www.youtube.com/watch?v=oHg5SJYRHA0')
                })
            setTimeout(function(){
                $bird.css({left: ($(window).width() + 50) + 'px'})
                setTimeout(function(){
                    $bird.remove()
                }, refreshPeriod)
            }, 1)
        }, Math.random() * refreshPeriod)
    }
  }
}

function pickColor(val){
    if (val < 5)
        return '#f9d65e'
    if (val < 15)
        return '#f39334'
    else if (val < 25)
        return '#ed5b31'
    else
        return '#FF3333'
}

function initVisualization(){
    d3.select('#visualization').append('svg:svg')
    fitCanvas()
}

function copy(obj){
    var ret = {}
    for (var k in obj)
        ret[k] = obj[k]
    return ret
}

function updateVisualization(summary){
    summary = copy(summary)
    
    // First remove the words we don't want to show
    for (var word in summary){
        if (word === query || summary[word] < 3)
            delete summary[word]
    }
    
    // loop through the existing nodes and either remove the node
    // or initialize a data object in the array
    var data = []
    $('svg g').each(function(){
        var $node = $(this),
            word = $node.data('word')
        if (!(word in summary))
            $node.remove()
        else{
            data.push({word: word, count: summary[word], value: summary[word]})
            // remove the word from the summary dict
            delete summary[word]
        }
    })
    
    // Add the newly added words
    for (var word in summary){
        data.push({word: word, count: summary[word], value: summary[word]})
    }

    var bubbles = bubble().nodes({children: data})
        .filter( function(d) { return !d.children; } )

    var allNodes = d3.select('#visualization')
        .select('svg')
        .selectAll('g.node')
        .data(bubbles)

    var newNodes = allNodes
        .enter().append('svg:g')
            .attr('class', 'node')

    newNodes.append("svg:circle")
        .attr("r", function(d) { return 1; })

    newNodes.append("svg:text")
        .attr("text-anchor", "middle")
        .attr("dy", ".3em")
        .style('font-size', function(d){
            return '1px'
        })
        
        
    allNodes
      .attr('data-word', function(d){ return d.word })
      .transition()
        .duration(animateDuration)
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"
        })
        .style('visibility', function(d){
            return d.count === 0 ? 'hidden': 'visible'
        })
    allNodes
        .select("circle")
          .style("fill", function(d) { return pickColor(d.value) })
          .transition()
          .duration(animateDuration)
          .attr("r", function(d) { return d.r; } )
    allNodes
        .select('text')
            .text(function(d){
                return d.count === 0 ? '' : d.word
            })
            .transition()
            .duration(animateDuration)
            .style('fill', function(d){
                return d.value >= 25 ? '#fafafa' : '#000'
            })
            .style('font-size', function(d){
                if (d.word.length < 3)
                    return d.r + 'px'
                return (d.r * (2 + 0.7) / d.word.length) + 'px'
            })
}

function reset(){
    frequencies = []
    wordToElement = {}
    wordToIdx = {}
    summary = {}
    sinceID = null
    timeoutID = null   
    d3.select('#visualization')
        .select('svg')
        .selectAll('g.node')
        .data([])
        .exit().remove()
}

function decodeEntity(text){
    return $("<div/>").html(text).text()
}

function poll(){
    var params = {
        q: query,
        lang: 'en'
    }
    if (sinceID)
        params.since_id = sinceID
    $.ajax({
        url: 'http://search.twitter.com/search.json',
        data: params,
        dataType: 'jsonp',
        error: function(){
            setTimeout(poll, refreshPeriod)
        },
        success: function(data){
            if (stop) return
            if (params.q === query){
                _(data.results).each(function(tweet, i){
                    if (i === 0) sinceID = tweet.id_str
                    var text = decodeEntity(tweet.text)
                    var freq = wordSummary(text)
                    frequencies.push(freq)
                    for (var word in freq){
                        if (!(word in summary))
                            summary[word] = 0
                        summary[word]++
                    }
                    if (frequencies.length > windowSize){
                        var last = frequencies[0]
                        frequencies.splice(0, 1)
                        for (var word in last)
                            summary[word]--
                    }
                })
                if (data.results.length > 0)
                    blueBirdFly(data.results.length)
                if (data.results.length > 0)
                    updateVisualization(summary)
            }
            setTimeout(poll, refreshPeriod)
        }
    })
}

function getTrends(){
    $.ajax({
        url: 'http://api.twitter.com/1/trends/23424977.json',
        dataType: 'jsonp',
        error: function(){
            setTimeout(getTrends, refreshTrendsPeriod)
        },
        success: function(data){
            data = data[0]
            $('#trends ul').html(_(data.trends).map(function(trend){
                var url = trend.name
                if (url.charAt(0) === '#')
                    url = escape(url.substring(0, 1)) + url.substring(1)
                return '<li><a href="' + url + '">' + trend.name + '</a></li>'
            }).join(' '))
                .find('a')
            $("#trends h4").html("Trends:");
            setTimeout(getTrends, refreshTrendsPeriod)
        }
    })
}

function setQuery(q){
    query = q
    try{
        query = query.match(/^[^a-zA-Z0-9]*(.*?)[^a-zA-Z0-9]*$/)[1]
    }catch(e){}
    if (running){
        //console.log('reseting')
        reset()
    }else{
        running = true
        poll()
    }
    var $search = $('#search'),
        $input = $('#input'),
        $display = $('#queryDisplay'),
        $header = $display.find('h1')
    $input.hide()
    $header.html(q)
    $display.show()
}


function promptForChromeFrame(){
    trackEvent('Chrome frame')
    var script = document.createElement('script')
    script.setAttribute('src', 'http://ajax.googleapis.com/ajax/libs/chrome-frame/1.0.3/CFInstall.min.js')
    document.body.appendChild(script)
    $("<script>CFInstall.check({mode:'overlay'})</script>").appendTo(document.body)
}

function initQuery(){
  if( typeof initialQuery !== "undefined" ){
    setQuery( initialQuery );
    poll();
  }
}

$(function(){
    if (navigator.userAgent.match(/MSIE/)){
        $('#ieblurb').show()
        $('#frontpage').hide()
        $('#top').hide()
        $('#yesToChromeFrame').click(promptForChromeFrame)
        return
    }
    
    fitCanvas()
    initVisualization()
    initQuery()
    getTrends()
    
    var $search = $('#search'),
        $input = $('#input'),
        $display = $('#queryDisplay'),
        $header = $display.find('h1'),
        $changeLink = $('#changeLink'),
        $stopBotton = $('#stopButton'),
        $tweetsButton = $('#tweetsLink'),
        $birdsLink = $("#birdsLink")
        
    $search.keyup(function(e){
      
        if (e.keyCode === 13){
          
          var url = window.location.protocol + '//' + window.location.hostname
              , t = $(this).val()
              , port = window.location.port;

          if(port != 80)
            url = url + ':' + port;
              
          if( t )
            document.location.href = url + '/' + encodeURIComponent(t) ;
            
          e.preventDefault();
        } 
        
    })
    
    $birdsLink.tipsy({gravity: 'n'});
    $birdsLink.click(function(e) {
      
      if( showBirds ){
        showBirds = false;
        $birdsLink.text( 'birds off' );
      } else {
        showBirds = true;
        $birdsLink.text( 'birds on' );
      }
      
      e.preventDefault();
    });
    
    $changeLink.click(function(){
        $display.hide()
        $input.show().val('').focus()
        return false
    })
    
    $tweetsButton.click(function(){
        trackEvent('Open tweets')
        window.open('http://twitter.com/search/' + query)
        return false
    })
    
    $stopBotton.click(function(){
        stop = true
    })
    
    $(window).resize(fitCanvas)
})