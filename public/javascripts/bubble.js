
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
      .style("fill", function(d) { return fill(d.packageName); });

  node.append("svg:text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .text(function(d) { return d.className.substring(0, d.r / 3); });
      
  setTimeout(function(){

      // simulate new values for existing circles
      delete data.r
      delete data.x
      delete data.y
      var i = 0;
      for (i = 0, len = data.children.length; i < len; i++){
          var c = data.children[i]
          c.value = c.value + Math.floor(Math.random() * (20 - 3 + 1) + 3);
          delete c.r
          delete c.x
          delete c.y
          data.children[i] = c;
      }
      
      // simulate addition of new circles
      data.children[ i ] = { value: Math.floor(Math.random() * (40 - 5 + 1) + 5),
                             packageName: 'Test Package',
                             className: 'Test Class Name' };
      
     var newest = data.children[ i ];
     var newNode = d3.select("#chart").select("svg")
                     .append("svg:g").attr("class", "node");
     
     newNode.append("svg:title")
            .text(newest.packageName);
         
     newNode.append("svg:circle")
             .attr("r", 0)
             .style("fill", "#cc0000" );
         
     newNode.append("svg:text")
             .attr("text-anchor", "middle")
             .attr("dy", ".3em")
             .text( newest.className );
     
      vis.selectAll("g.node").data( bubble.nodes( data ).filter( function(d) { return !d.children; } ) )
        .transition()
          .duration(1000)
          .attr("transform", function(d) { return "translate(" + (d.x) + "," + d.y + ")"; })
          .select("circle")
            .transition()
            .duration(1000)
            .attr("r", function(d) { if(d.className === 'AgglomerativeCluster') console.log(d); return d.r; } );
       
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