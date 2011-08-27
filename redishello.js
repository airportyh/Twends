var redis = require('redis'),
    Twitter = require('twitter-node').TwitterNode,
    fs = require('fs'),
    wordfreq = require('./public/javascripts/wordfreq')

var conf = JSON.parse(fs.readFileSync('twitter.conf')),
    rds = redis.createClient()

var twitter = new Twitter({
    user: conf.user,
    password: conf.password,
    action: 'sample'
})

twitter.addListener('tweet', function(tweet){
    console.log(tweet.text)
})
twitter.stream()