#! /usr/bin/env node

var redis = require('redis'),
    Twitter = require('twitter-node').TwitterNode,
    fs = require('fs'),
    wordfreq = require('./public/javascripts/wordfreq'),
    duration = Number(process.argv[2]) || 0,
    track = process.argv.slice(3),
    startTime = new Date(),
    conf = JSON.parse(fs.readFileSync('twitter.conf')),
    rds = redis.createClient()

console.log('Collecting data for ' + duration + ' seconds.')
var params = {
    user: conf.user,
    password: conf.password
}
if (track.length > 0){
    console.log('Tracking ' + track.join(' ') + '.')
    params.track = track
    params.action = 'filter'
}else{
    console.log('Sifting public timeline.')
    params.action = 'sample'
}
var twitter = new Twitter(params)

twitter.addListener('tweet', function(tweet){
    process.stdout.write('.')
    var words = wordfreq.tokenize(tweet.text)
    words.forEach(function(word){
        rds.sadd('words', word)
        rds.incr('word:' + word)
    })
})
twitter.stream()

setTimeout(function(){
    process.exit()
}, duration * 1000)