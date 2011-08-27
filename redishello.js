var redis = require('redis'),
    Twitter = require('twitter-node').TwitterNode

var r = redis.createClient()

var twitter = new Twitter({
    
})
r.sadd('words', 'bob'