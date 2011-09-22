
/**
 * Module dependencies.
 */

var express = require('express')

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Example 500 page
app.error(function(err, req, res){
  res.render('500',{
    locals: {
      title: 'Something went wrong :(('
    }
  });
});

// Example 404 page via simple Connect middleware
app.use(function(req, res){
  res.render('404',{
    locals: {
      title: 'Not found :(('
    }
  });
});

// Routes

app.get('/', function(req, res){
  res.render('index', {});
});

// General search
app.get('/:term', function(req, res){
  res.render('vis', { term: req.params.term });
});

// Only listen on $ node app.js

if (!module.parent) {
  var port = process.env.NODE_ENV === 'production' ? 21780 : 8080
  app.listen(port);
  console.log("Express server listening on port %d", app.address().port);
}
