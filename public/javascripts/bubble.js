var hsl = {
  green: {
      hue: 146,
      saturation: 100,
      lightness: 25,
      min: 100
  },
  red: {
      hue: 356,
      saturation: 100,
      lightness: 25,
      min: 30
  },
  grey: {
      hue: 0,
      saturation: 0,
      lightness: 58,
      min: 600
  }
}

var r = 960,
    format = d3.format(",d"),
    fill = d3.scale.category20c();

var bubble = d3.layout.pack()
    .sort(null)
    .size([r, r]);

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", r)
    .attr("height", r)
    .attr("class", "bubble");

var data
d3.json( 'javascripts/sample.json', function(json) {
  
  data = classes(json);
  
  var node = vis.selectAll("g.node")
      .data( bubble.nodes(data).filter( function(d) { return !d.children; } ) )
    .enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  node.append("svg:title")
      .text(function(d) { return d.className + ": " + format(d.value); });

  node.append("svg:circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { return hslFromVal( d.value ); });

  node.append("svg:text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .text(function(d) { return d.className.substring(0, d.r / 3); });
      
  setTimeout(function(){

      // simulate new values for existing circles
      var i = 0;
      for (i = 0, len = data.children.length; i < len; i++){
          var c = data.children[i]
          c.value = c.value + Math.floor(Math.random() * (20 - 3 + 1) + 3);
          delete c.r
          delete c.x
          delete c.y
          data.children[i] = c;
      }
      
      // simulate addition of new circles (one per iteration)
      data.children[ i ] = { value: Math.floor(Math.random() * (40 - 5 + 1) + 5),
                             packageName: 'TestPackage',
                             className: 'TestClassName' };
      
     var newest = data.children[ i ];
     var newNode = d3.select("#chart").select("svg")
                     .append("svg:g").attr("class", "node");
     
    var nodes = vis.selectAll("g.node").data( bubble.nodes( data ).filter( function(d) { return !d.children; } ) );
    
    var newNode = nodes.enter().append("svg:g").attr("class", "node");
    
    newNode.append("svg:title")
            .text(newest.packageName);
         
    newNode.append("svg:circle")
           .attr("r", 0)
           .style("fill", function(d) { 
             return hslFromVal( d.value );
            });
         
    newNode.append("svg:text")
           .attr("text-anchor", "middle")
           .attr("dy", ".3em")
           .text( newest.className );
             
    nodes
      .transition()
        .duration(1000)
        .attr("transform", function(d) { return "translate(" + (d.x) + "," + d.y + ")"; })
        .select("circle")
          .transition()
          .duration(1000)
          .attr("r", function(d) { return d.r; } )
          .style("fill", function(d) { return hslFromVal( d.value ); });
          
     nodes
      .select("title")
      .text(function(d) { return d.packageName + ': ' + d.value; });
       
  }, 3000);
});

// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root) {
  var classes = [];

  function recurse(name, node) {
    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
    else classes.push({packageName: name, className: node.name, value: node.size});
  }

  recurse(null, root);
  return {children: classes};
}

function hslFromVal( val ){
  
  var color = 'green';
  
  if( val < hsl.green.min ){
    color = ( val < hsl.red.min ) ? 'red' : 'grey';
  }
  
  // todo: intelligently figure out lightness
  lightness = hsl[ color ].lightness + Math.floor(Math.random() * (10 - 5 + 1) + 5);
  
  // todo: figure out alpha
  return "hsl(" + hsl[ color ].hue + ", " + hsl[ color ].saturation + "%, " +lightness + "%)";
}





