/* Authors: Toby Ho, Rob Faraj */

/* Global Variables!!! Ack! */
var frequencies = [],
    wordToElement = {},
    summary = {},
    windowSize = 50,
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
    hsl = {
      green: {
          hue: 146,
          saturation: 100,
          lightness: 25,
          min: 1000
      },
      red: {
          hue: 356,
          saturation: 100,
          lightness: 25,
          min: 200
      },
      grey: {
          hue: 0,
          saturation: 0,
          lightness: 58,
          min: 600
      }
    }
    
function bubble(){
    return d3.layout.pack()
        .sort(null)
        .size([canvasWidth, canvasHeight])
}
    
function fitCanvas(){        
    canvasHeight = $(window).height() - $('#top').height()
    canvasWidth = $(window).width()
    d3.select('#visualization svg')
        .attr('width', canvasWidth)
        .attr('height', canvasHeight)
}

function blueBirdFly(num){
    for (var i = 0; i < num; i++){
        setTimeout(function(){
            var $bird = $('<img class="bird" src="images/blue-bird.png"/>')
                .prependTo('body')
                .css({top: ($(window).height() * Math.random()) + 'px'})
                .click(function(){
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

function pickColor(val){
    console.log('val: ' + val)
    if (val < 5)
        return '#fdff91'
    if (val < 12)
        return '#ff8600'
    else if (val < 20)
        return '#ff423f'
    else
        return '#fe57a1'
}

function initVisualization(){
    d3.select('#visualization').append('svg:svg')
    fitCanvas()
}

function updateVisualization(summary){
    var words = _.keys(summary).map(function(word){
        return {word: word, value: summary[word]}
    }).filter(function(pair){
        return pair[0] !== query || pair[1] < 3
    })
    
    if (_(wordToIdx).isEmpty()){
        _(words).each(function(word, idx){
            wordToIdx[word.word] = idx
        })
    }
    
    prevData = data
    // build thedata array
    data = []
    var svg = $('#visualization svg')[0]
    for (var word in wordToIdx){
        var idx = wordToIdx[word]
        if (word in summary &&
            word !== query.toLowerCase() &&
            summary[word] > 2){
            data[idx] = {
                count: summary[word], 
                value: summary[word], 
                word: word
            }
        }else{
            
            // hole
            data[idx] = null
            // remove the actual element
            var found = $('#visualization svg g')
                .filter(function(){
                    return $(this).find('text').text() === word
                })
            if (found.length > 0)
                found.remove()
        }
    }
    
    data = data.filter(function(d){
        return d !== null
    })
    
    if (data.length === 0)
        return

    var bubbles = bubble().nodes({children: data})
        .filter( function(d) { return !d.children; } )
    
    

    var allNodes = d3.select('#visualization')
        .select('svg')
        .selectAll('g.node')
        .data(bubbles)

    var newNodes = allNodes
        .enter().append('svg:g')
            .attr('class', 'node')
            
    
            
    if (!window.newNodes)
        window.newNodes = newNodes
        

    newNodes.append("svg:circle")
        .attr("r", function(d) { return 1; })
        

    newNodes.append("svg:text")
        .attr("text-anchor", "middle")
        .attr("dy", ".3em")
        .style('font-size', function(d){
            return '1px'
        })
        
    allNodes
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
    $.ajax({
        url: 'http://search.twitter.com/search.json',
        data: {
            q: query,
            lang: 'en',
            since_id: sinceID
        },
        dataType: 'jsonp',
        error: function(){
            setTimeout(poll, refreshPeriod)
        },
        success: function(data){
            if (stop) return
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
            setTimeout(poll, refreshPeriod)
        }
    })
}

function getTrends(cb){
    $.ajax({
        url: 'http://api.twitter.com/1/trends.json',
        dataType: 'jsonp',
        success: function(data){
            $('#trends').html(_(data.trends).map(function(trend){
                return '<a href="#">' + trend.name + '</a>'
            }).join(' '))
                .find('a')
                    .click(function(){
                        setQuery($(this).text())
                    })
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


$(function(){
    fitCanvas()
    initVisualization()
    getTrends()
    var $search = $('#search'),
        $input = $('#input'),
        $display = $('#queryDisplay'),
        $header = $display.find('h1'),
        $changeLink = $('#changeLink'),
        $stopBotton = $('#stopButton'),
        $tweetsButton = $('#tweetsLink')
    $search.keyup(function(e){
        if (e.keyCode === 13){
            setQuery($(this).val())
        }
    })
    $changeLink.click(function(){
        $display.hide()
        $input.show().val('').focus()
        return false
    })
    $tweetsButton.click(function(){
        window.open('http://twitter.com/search/' + query)
        return false
    })
    $stopBotton.click(function(){
        console.log('stopped')
        stop = true
    })
    $(window).resize(fitCanvas)
})

function hslFromVal( val ){
  
  var color = 'green';
  
  if( val < hsl.green.min ){
    color = ( val < hsl.red.min ) ? 'red' : 'grey';
  }
  
  // todo: figure out lightness from confidence
  lightness = hsl[ color ].lightness + Math.floor(Math.random() * (10 - 5 + 1) + 5);
  
  return "hsl(" + hsl[ color ].hue + ", " + hsl[ color ].saturation + "%, " +lightness + "%)";
}