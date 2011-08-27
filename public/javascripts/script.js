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
         .replace(/[^\'a-zA-Z]/g, ' ')
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

var frequencies = [],
    summary = {},
    window_size = 200

$(function(){
    $.ajax({
        url: 'http://search.twitter.com/search.json',
        data: {
            q: 'node.js',
            lang: 'en'
        },
        dataType: 'jsonp',
        success: function(data){
            _.each(data.results, function(tweet){
                var text = tweet.text
                var freq = wordSummary(text, CommonWords.english)
                frequencies.push(freq)
                console.log(text)
            })
        }
    })
})






















