#! /usr/bin/env node

var redis = require('redis'),
    rds = redis.createClient(),
    fetched = 0,
    summary = {},
    levels = [10, 50, 100, 500, 1000]


rds.smembers('words', function(err, words){
    console.log(words.length + ' words total.')
    words.forEach(function(word){
        rds.get('word:' + word, function(err, count){
            fetched++
            levels.forEach(function(level){
                
            })
        })
    })
})
