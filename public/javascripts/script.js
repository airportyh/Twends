/* Author: Toby Ho, Rob Faraj

*/

var CommonWords = {}
CommonWords.english = "a about after again against all an another any and are as at\
 be being been before but by\
 can could\
 did do don't down\
 each\
 few from for\
 get got great\
 had has have he her here his him himself hers how\
 i if i'm in into is it it's\
 just\
 like\
 made me more most my\
 no not\
 of off on once one only or other our out over own\
 said she should so some such\
 than that the their them then there these they this those through to too\
 under until up\
 very\
 was wasn't we were we're what when where which while who why will with would wouldn't\
 you your".split(' ')
 
function tokenize(text, commonWords){
    return text
        .split(' ')
        .filter(function(p){return p != ''})
        .map(function(word){
            return word.toLowerCase()
        })
        .filter(function(word){
        	return commonWords.indexOf(word) == -1
        })
}

function wordSummary(text, commonWords){
    var words = tokenize(text, commonWords)
    var freq = {}
    words.forEach(function(word){ 
        freq[word] = (freq[word] || 0) + 1
    })
    return freq
}

function printSummary(summary){
    var pairs = _.keys(summary).map(function(key){
        return [key, summary[key]]
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
    windowSize = 200,
    sinceID = null,
    running = false,
    query = null


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
            _.each(data.results, function(tweet, i){
                if (i === 0) sinceID = tweet.id_str
                var text = tweet.text
                var freq = wordSummary(text, CommonWords.english)
                frequencies.push(freq)
                for (var word in freq){
                    if (!(word in summary))
                        summary[word] = 0
                    summary[word]++
                }
                if (frequencies.length > windowSize){
                    var last = frequencies[0]
                    frequencies = frequencies.slice(1)
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






















