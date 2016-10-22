Template.phamilies.helpers({
  //flare: flare
});

Template.phamilies.onRendered(function () {
  console.log('rendered phamilies');

  var diameter = $(document).width() * 0.4,
    radius = diameter / 2,
    innerRadius = radius * 0.95;

  var cluster = d3.layout.cluster()
    .size([360, innerRadius])
    // sort phages according to their cluster, but also need to sort alphabetically
    .sort(function(a, b) {return d3.ascending(a.cluster, b.cluster);})
    .value(function(d) { return d.size; });

  var bundle = d3.layout.bundle();

  var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(0)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

  var svg = d3.select("#phamCircle")
  //var svg = d3.select(".container").append("svg")

    .attr("width", "100%")
    .attr("height", diameter * 1.5)
    .append("g")
    .attr("transform", "translate(" + radius * 1.5 + "," + radius * 1.5 + ")");

  var link = svg.append("g").selectAll(".link"),
    node = svg.append("g").selectAll(".node"),
    phageCluster = svg.append("g").selectAll(".phageCluster");

  var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(innerRadius + 15)
    .startAngle(0 * (Math.PI/180)) //converting from degs to radians
    .endAngle(6.28); //just radians

  svg
  .append("path")
    .attr("d", arc)
    .attr("fill", "red")
    .attr("opacity", 0.75);
    //.attr("transform", "translate(200,200)");

  d3.json("flare-imports.json", function(error, classes) {
    //d3.json.parse(flare, function (error, classes) {
    //classes = JSON.parse(flare);
    if (error) throw error;
    var nodes = cluster.nodes(packageHierarchy(classes)),
      links = packageImports(nodes);
    //console.log(bundle(links));
    link = link
      .data(bundle(links))
      .enter().append("path")
      .each(function (d) {
        d.source = d[0];
        d.target = d[d.length - 1];
      })
      .attr("class", "link")
      .attr("d", line);

    node = node
      .data(nodes.filter(function (n) {
        return !n.children;
      }))
      .enter().append("text")
      .attr("class", "node")
      .attr("dy", ".3em")
      .attr("transform", function (d) {
        return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 20) + ",0)" + (d.x < 180 ? "" : "rotate(180)");
      }) // 20 is the spacing of labels from circle
      .style("text-anchor", function (d) {
        return d.x < 180 ? "start" : "end";
      })
      .text(function (d) {
        return d.key;
      })
      .on("mouseover", mouseovered)
      .on("mouseout", mouseouted);
    //});

    function mouseovered(d) {
      node
        .each(function (n) {
          n.target = n.source = false;
        });

      link
        .classed("link--target", function (l) {
          if (l.target === d) return l.source.source = true;
        })
        .classed("link--source", function (l) {
          if (l.source === d) return l.target.target = true;
        })
        .filter(function (l) {
          return l.target === d || l.source === d;
        })
        .each(function () {
          this.parentNode.appendChild(this);
        });

      node
        .classed("node--target", function (n) {
          return n.target;
        })
        .classed("node--source", function (n) {
          return n.source;
        });
    }

    function mouseouted(d) {
      link
        .classed("link--target", false)
        .classed("link--source", false);

      node
        .classed("node--target", false)
        .classed("node--source", false);
    }

    d3.select(self.frameElement).style("height", diameter + "px");

// Lazily construct the package hierarchy from class names.
    function packageHierarchy(classes) {
      var map = {};

      function find(name, data) {
        var node = map[name];
        if (!node) {
          node = map[name] = data || {name: name, children: []};
          if (name.length) {
            node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
            node.parent.children.push(node);
            node.key = name.substring(i + 1);
          }
        }
        return node;
      }

      classes.forEach(function (d) {
        find(d.name, d);
      });
      return map[""];
    }

// Return a list of imports for the given array of nodes.
    function packageImports(nodes) {
      var map = {},
        imports = [];

      // Compute a map from name to node.
      nodes.forEach(function (d) {
        map[d.name] = d;
      });

      // For each import, construct a link from the source to target node.
      nodes.forEach(function (d) {
        if (d.imports) d.imports.forEach(function (i) {
          imports.push({source: map[d.name], target: map[i]});
        });
      });

      return imports;
    }
  });
});