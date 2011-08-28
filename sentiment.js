#! /usr/bin/env node

var twittersentiment = require('./lib/twittersentiment')();

twittersentiment.fetch( 'miami', {}, function( err, term, resp ) {
  
  console.log(resp);
  
});
 


