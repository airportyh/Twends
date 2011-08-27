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
    for (var word in wordToIdx)
        if (word in summary &&
            word !== query.toLowerCase() &&
            summary[word] >= 2){
            data[wordToIdx[word]] = {
                count: summary[word], 
                value: summary[word] * 100, 
                word: word
            }
        }else{
            // hole
            data[wordToIdx[word]] = {count: 0, value: 50, word: ''}
        }
    
    
    // remove all zeros at the end of the array
    /*var last
    while((last = _(data).last()) && last.value === 0)
        data.splice(data.length - 1, 1)
    */
    _(data).each(function(d){
        if (d.value === 0)
            d.value = 1
    })
    

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
    
    newNodes.append("svg:title")
        

    newNodes.append("svg:circle")
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return hslFromVal(d.value) })

    newNodes.append("svg:text")
        .attr("text-anchor", "middle")
        .attr("dy", ".3em")
        
        
    allNodes
      .transition()
        .duration(1000)
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"
        })
        .style('visibility', function(d){
            return d.count === 0 ? 'hidden': 'visible'
        })
    allNodes
        .select("circle")
          .transition()
          .duration(1000)
          .attr("r", function(d) { return d.r; } )
    allNodes
        .select('title')
            .text(function(d) { 
                return d.count === 0 ? '' : d3.format(',d')(d.count) })
    allNodes
        .select('text')
            .text(function(d){
                return d.count === 0 ? '' : d.word
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
                updateVisualization(summary)
            timeoutID = setTimeout(poll, 2000)
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
        $label = $display.find('label'),
        $changeLink = $display.find('a')
    $input.hide()
    $label.html(q)
    $display.show()
}


$(function(){
    fitCanvas()
    initVisualization()
    getTrends()
    var $search = $('#search'),
        $input = $('#input'),
        $display = $('#queryDisplay'),
        $label = $display.find('label'),
        $changeLink = $display.find('a'),
        $stopBotton = $('#stopButton')
    $search.keyup(function(e){
        if (e.keyCode === 13){
            setQuery($(this).val())
        }
    })
    $changeLink.click(function(){
        $display.hide()
        $input.show().val('').focus()
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






















