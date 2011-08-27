/* Authors: Toby Ho, Rob Faraj */

function printSummary(summary){
    var pairs = _.keys(summary).map(function(key){
        return [key, summary[key]]
    }).filter(function(pair){
        return pair[0] !== query
    }).sort(function(one, other){
        return other[1] - one[1]
    }).slice(0, 10)
    $('#visualization').text(pairs.map(function(p){ return p[0] + '(' + p[1] + ')' })
        .join(' '))
}

function reset(){
    frequencies = []
    wordToElement = {}
    summary = {}
    sinceID = null
    timeoutID = null    
}

/* Global Variables!!! Ack! */
var frequencies = [],
    wordToElement = {},
    summary = {},
    windowSize = 50,
    sinceID = null,
    running = false,
    query = null

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
            printSummary(summary)
            timeoutID = setTimeout(poll, 1000)
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
    if (running){
        console.log('reseting')
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
    $label.html(query)
    $display.show()
}

$(function(){
    getTrends()
    var $search = $('#search'),
        $input = $('#input'),
        $display = $('#queryDisplay'),
        $label = $display.find('label'),
        $changeLink = $display.find('a')
    $search.keyup(function(e){
        if (e.keyCode === 13){
            setQuery($(this).val())
        }
    })
    $changeLink.click(function(){
        $display.hide()
        $input.show().val('').focus()
    })
})






















