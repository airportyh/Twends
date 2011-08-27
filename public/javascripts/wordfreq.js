/* Authors: Toby Ho, Rob Faraj */

var CommonWords = "a about after again against all an another any and are as at\
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
 you your rt".split(' ')
 
function tokenize(text){
    return text
        .split(' ')
        .filter(function(p){return p != ''})
        .map(function(word){
            word = word.toLowerCase()
            try{
                return word.match(/^[^a-zA-Z0-9]*(.*?)[^a-zA-Z0-9]*$/)[1]
            }catch(e){
                return word
            }
        })
        .filter(function(word){
        	return CommonWords.indexOf(word) == -1
        })
}

function wordSummary(text){
    var words = tokenize(text)
    var freq = {}
    words.forEach(function(word){ 
        freq[word] = (freq[word] || 0) + 1
    })
    return freq
}

if (typeof exports !== 'undefined'){
    exports.wordSummary = wordSummary
    exports.tokenize = tokenize
}