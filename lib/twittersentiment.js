// singleHeartbeat
// multiHeartbeat
// bidHistory

var http = require('http')
           , querystring = require('querystring')
           , sys = require('sys');
		
module.exports = TwitterSentiment;		

function TwitterSentiment( options ){
	
	if( ! (this instanceof arguments.callee) ) {
		return new arguments.callee( arguments );
	}
		
	var self = this;
	
  self.host = 'twittersentiment.appspot.com';
  
  self.headers = options.headers || { 
									'Host': self.host
								,	'User-Agent': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_6; en-US) AppleWebKit/534.15 (KHTML, like Gecko) Chrome/10.0.612.3 Safari/534.15'
								, 'Accept': '*/*'
								, 'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7'
								, 'Accept-Language': 'en-us,en'
								, 'Connection': 'keep-alive'
								, 'Referer': 'http://twittersentiment.appspot.com/' };
								
								// 								, 'Cookie': 'JSESSIONID=NYVfJQ8PBl4wr5MMiIX9Fg;'
	
};

TwitterSentiment.prototype.getUrl = function( ) {
 // return '/search';
  return '/api/tweets';
};

TwitterSentiment.prototype.getParams = function( term, options ) {
  var params = options || {};
  params.query = term;
  //params.callback = '_callbacks_._1grv6kafk';
  return params;
};

TwitterSentiment.prototype.fetch = function( term, params, cb ) {
	
	var self = this,
	    uri = self.getUrl( ),
	    options = {},
			randomnumber = Math.floor( Math.random() * ( 999 - 100 + 1 ) + 100 );
	
	sys.log('## Fetch S ## ['+ randomnumber +'] [' + term + '] ');
	options.host = self.host;
	options.path = uri + '?' + querystring.stringify( self.getParams( term, params || {} ) );
	options.method = 'GET';
	options.headers = self.headers;
	
	console.log(options);
	//console.log(uri + '?' + querystring.stringify( self.getParams( term, params ) ));
	
  var req = http.request(options, function( res ) {
    
    res.setEncoding('utf8');
    
    var data = '';
	  res.on('data', function( chunk ){
	     data += chunk;
	  });

	  res.on('end', function(){
	    
		  if( data ){
		    
		    // check for JSESSIONID set
		    if(res && res.headers 
		           && res.headers[ 'set-cookie' ]
		           && res.headers[ 'set-cookie' ][ 0 ].indexOf("JSESSION") != -1 ){
		             
		        var b = querystring.parse( res.headers[ 'set-cookie' ][ 0 ], sep=';', eq='=');
		        
		        // set cookie
		        self.headers[ 'Cookie' ] = 'JSESSIONID=' + b.JSESSIONID;
		        //self.headers[ 'Cookie' ] = 'JSESSIONID=NYVfJQ8PBl4wr5MMiIX9Fg';
		        
		        sys.log('## Cookie ## ['+ randomnumber +'] [' + uri + '] [' + res.headers[ 'set-cookie' ][ 0 ] + '] ');
		        
		        // rerun request
		        self.fetch( term, params, cb );
		    } else {
		    
				  sys.log('## Fetch E ## ['+ randomnumber +'] [' + uri + '] [' + res.statusCode + '] ');
				
          if (cb && typeof cb === "function"){
            cb( null, term, data );
          }
        }
				
			} else {
			  
				sys.log('## Fetch F ## ['+ randomnumber +'] [' + uri + '] [' + res.statusCode + '] ');
				if (cb && typeof cb === "function"){
          cb( 1, term, data );
        }
				
			}
			
	   });

  });

  req.end();
};