/*
 d3.select('.determinate').style("width", function() {
 var phageCount = selectedGenomes.find().count();
 p = d3.selectAll(".phages")[0].length;
 console.log("p", p);
 percent = ((100 * p/phageCount).toString() + "%");
 console.log("setting progress bar %", percent);
 return percent;
 });
*/
var colorsys = require('colorsys');

selectedGenomes = new Meteor.Collection(null);


Template.phages.onCreated(function() {
  //Meteor.subscribe('genomes');
  console.log("phages template created");

});

//in rendered callback
var key = function(d) {
  return d.phagename;
};

getBlastAlignments = function(phages) {
  console.log("getting BLAST alignments for", phages);
  if (phages.length < 2) return;
  s1 = phages[0].sequence;
  s2 = phages[1].sequence;
  myURL = "http://phage.csm.jmu.edu:8080/";
  console.log(myURL);
  $.ajax({
    type: "POST",
    method: "POST",
    url: myURL,
    data: {seq1: s1, seq2: s2},
    //dataType: 'jsonp',
    dataType: 'json',
    //processData: false,
    jsonp: false,
    //contentType: 'application/json; charset=utf-8',
    //crossDomain: true,
    //jsonpCallback: 'callback',
    success: function (data) {
      drawBlastAlignments(data);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("ERROR:", textStatus, errorThrown);
    }
  });
};

drawBlastAlignments = function (json) {
  console.log('drawing BLAST alignments');
  //d3.json(jsonData, function(error, json) {
    console.log(json);
    var data = function(hsps) {
      var paths = Array();
      hsps.forEach(function(value, index, myArray) {
        var dataset = Array();
        dataset.push({x: value.query_from/10, y: 180, evalue: value.evalue});
        dataset.push({x: value.query_to/10, y: 180});
        dataset.push({x: value.hit_to/10, y: 450});
        dataset.push({x: value.hit_from/10, y: 450});
        paths.push(dataset);
      });
      return paths;
    };

    var hsps = json.BlastOutput2.report.results.bl2seq[0].hits[0].hsps;
    pathset = data(hsps);
    var hsps = svg.selectAll(".hsps")
      .data(pathset);
    var d3line2 = d3.svg.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; })
      .interpolate("linear-closed");
    hsps.enter()
      .insert("svg:path", ":first-child")
      .on("mouseover", function(d){
        d3.select(this).style("stroke", "gold");
        //console.log(d);
        tooltip.html("e-value: " + d[0].evalue);
        tooltip.style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
          .style("opacity", 1);
        return tooltip.style("visibility", "visible");
      })
      .style("fill-opacity", 0)
      .style("stroke-width", 0)
      .attr("d", function(d) { //console.log(d);
        return d3line2(d);})
      .transition()
      .duration(1500)
      .delay(0)
      .style("stroke-width", 0)
      .style("stroke", "black")
      .style("fill", function (d) {
        evalue = d[0].evalue.toString();
        console.log("d:", d);
        console.log("evalue:", evalue);
        array1 = evalue.split('e');
        exp = array1[array1.length - 1];
        exp = Math.abs(+exp);
        if (exp == 0.0) { hue = 1.0; }
        else {
          hue = exp / 200.0;
        }
        console.log("hue", hue);
        hue = Math.min(hue, 0.75);

        hexcolor = colorsys.hsv_to_hex({ h: hue*360, s: 100, v: 100 });
        console.log("hexcolor:", hexcolor);
        return hexcolor;
      })
      .style("fill-opacity", 0.3);

    hsps//.on("mouseout", function(){d3.select(this).style("fill", "red");})
      .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
      .on("mouseout", function(){
        d3.select(this).style("stroke", "black");
        return tooltip.style("visibility", "hidden");
      });

    var tooltip = d3.select("body")
      .append("div")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .style("background","lightcyan")
      .style("width","150px")
      .style("height", "30px")
      .style("text-align", "center")
      .style("position", "absolute")
      .style("padding", "2px")
      .style("font", "Arial")
      .style("border-radius","8px");
  //});

};

drawGenomeMap = function (svg) {
  console.log("tracker autorun has rerun");
  //d3.selectAll("#mappy").remove();

  svg.attr("height", function(d) {return (selectedGenomes.find().count() * 300) });
  svg.attr("width", function (d) {
    return d3.max(selectedGenomes.find().fetch(), function(d) {
      //console.log(d.genomelength);
      return d.genomelength/10;
    })
  });




  // Define the div for the tooltip
  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  //d3.select('.determinate').style("width", "0%");

  function x() {
    console.log(d3.select(this).data());
  };

  var phage = svg.selectAll(".phages")
    .data(function() {
      pnames = selectedGenomes.find({},{phagename:1}).fetch().map(function(obj){ return obj.phagename;});
      phages = Genomes.find({phagename: {$in: pnames}}, {sort: {cluster:1, phagename:1}});
      //todo: get selected primary and secondary sort fields and ascending/descending
      return phages.fetch();
    }, key);

  phage
    .attr("transform", function (d, i) {
      return "translate(0," + ((i * 300)+150) + ")";
    });

  var newPhages = phage.enter().append("g")
    .classed("phages", true)
    .attr("transform", function (d, i) {
      return "translate(0," + ((i * 300)+150) + ")";
    });

  //newPhages.each(x);
  getBlastAlignments(phages.fetch());

  newPhages.append("text")
    .attr("x", 0)
    .attr("y", -120)
    .attr("font-family", "sans-serif")
    .attr("font-size", "24px")
    .attr("fill", "black")
    .style("text-anchor", "start")
    .text(function (d) {
      return d.phagename;
    })
    .attr({"fill-opacity": 0})
    .transition().delay(1500).duration(2000)
    .attr({"fill-opacity": 1});

    newPhages.append("rect") // background for ruler
    .attr({
      x: 0, y: 0, width: function (d) {
        //console.log(d);
        return d.genomelength / 10;
      }, height: 30
    })
    .style({"stroke-width": "2px", "fill": "white", "stroke": "black"})
    .attr("stroke-opacity", 0)
    .transition().duration(1000)
    .attr("stroke-opacity", 1);

  var group = newPhages.selectAll(".thousandticks")
    .data(function (d, i) {


      ticks = [];
        genome_positions = d3.range(d.genomelength);
        genome_positions.forEach(function (currentValue, index, myArray) {
          if (currentValue % 1000 === 0) {
            ticks.push(currentValue);
          }
        });
        return ticks;
      }
    )
    .enter()
    .append("g");
  group.append("rect")
    .style({"fill": "black"})
    .attr({
      x: function (d) {
        return d / 10;
      }, y: 0, width: "1px", height: 30
    })
    .attr({"fill-opacity": 0})
    .transition().duration(1500)
    .attr({"fill-opacity": 1});

  group.append("text") // kbp label
    .attr("x", function (d) {
      return (d / 10) + 3;
    })
    .attr("y", 12)
    .attr("font-family", "sans-serif")
    .attr("font-size", "14px")
    .attr("fill", "green")
    .style("text-anchor", "start")
    .text(function (d) {
      return d / 1000;
    })
    .attr({"fill-opacity": 0})
    .transition().duration(1500)
    .attr({"fill-opacity": 1});
  var group2 = newPhages.selectAll(".fivehundredticks")
    .data(function (d) {
      ticks = [];
      genome_positions = d3.range(d.genomelength);
      genome_positions.forEach(function (currentValue, index, myArray) {
        if (currentValue % 500 === 0 & currentValue % 1000 !== 0) {
          ticks.push(currentValue);
        }
      });
      return ticks;
    })
    .enter()
    .append("g");
  group2.append("rect")
    .style({"fill": "black"})
    .attr({
      x: function (d) {
        return d / 10;
      }, y: 0, width: "1px", height: 15
    })
    .attr({"fill-opacity": 0})
    .transition().duration(1500)
    .attr({"fill-opacity": 1});
  var group3 = newPhages.selectAll(".onehundredticks")
    .data(function (d) {
      ticks = [];
      genome_positions = d3.range(d.genomelength);
      genome_positions.forEach(function (currentValue, index, myArray) {
        if (currentValue % 100 === 0 & currentValue % 1000 !== 0 & currentValue % 500 !== 0) {
          ticks.push(currentValue);
        }
      });
      return ticks;
    })
    .enter()
    .append("g");
  group3.append("rect")
    .style({"fill": "black"})
    .attr({
      x: function (d) {
        return d / 10;
      }, y: 15, width: "1px", height: 15
    })
    .attr("fill-opacity", 0)
    .transition().duration(1500)
    .attr("fill-opacity", 1);

  gene = newPhages.selectAll(".genes")
    .data(function(d, i) { return d.genes;})
    .enter()
    .append("g").on("mouseover", function(d) {
      nodedata = this.parentNode.__data__;
      div.transition()
        .duration(500)
        .style("opacity", .9);
      div	.html(nodedata.phagename + " gp" + d.name)

      // the text of the tooltip ...
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
      div.transition()
        .duration(500)
        .style("opacity", 0);
    });
  gene_group_x = function(d) {
    return (d.start)/10;
  };
  gene_group_y = function(d) {
    //console.log(d);
    if (d.direction == "forward") {
      if (d.name % 2 === 0) {
        return  -70;
      }
      else { return -30;}
    }
    else if (d.direction == "reverse") {
      if (d.name % 2 === 0) {
        return 30;
      }
      else { return 60;}
    }
  };

  gene
    .attr("transform", function (d) { return "translate(" + gene_group_x(d) + "," + gene_group_y(d) + ")"});
  gene.append("rect")
    .attr("height", function (d) {return 30;})
    .style({"stroke":"black", "stroke-width": "2px"})
    .attr("fill", function (d) {
      return d.phamColor;
    })
    .attr("width", 0)
    .transition()
    .duration(1600)
    .attr("width", function (d) { return (d.stop-d.start)/10; })

  ;


  /*domain = gene.selectAll(".domains")
   .data(function(d, i) { return d.domains;})
   .enter()
   .append("g")
   .on('click', function(d,i){
   d3.select('#domain_header').text(d.description)
   d3.select('#domain_body').text(d.description + " description could go here")

   $('#modal1').openModal();
   })
   ;
   domain.append("rect")
   .attr("fill-opacity", 0)
   .attr("height", function (d) {return 28;})
   .attr("width", function (d) { return ((d.stop*3)-(d.start*3))/10; })
   .attr("x", function(d) {return (d.start*3)/10; })
   .attr("y", function (d) {
   g = this.parentNode.parentNode.__data__;
   if (g.direction == "forward") {
   if (g.name % 2 === 0) {
   return -78;
   }
   else { return -38;}
   }
   else if (g.direction == "reverse") {
   if (g.name % 2 === 0) {
   return 1;
   }
   else { return 1;}
   }
   })
   .attr("fill", "orange")
   .transition()
   .duration(750)
   .delay(3000)
   .attr("fill-opacity", 0.9);*/

  gene.append("text") // gene name
    .attr("x", function(d) { return ((d.stop - d.start)/2)/10;})
    .attr("y", function (d) {
      if (d.direction == "forward") {
        if (d.name % 2 === 0) { // forward and even
          return 20;
        }
        else { return 20;} // forward and odd
      }
      else if (d.direction == "reverse") {
        if (d.name % 2 === 0) { // reverse and even
          return 20;
        }
        else { return 20;} //reverse and odd
      }
    })
    .style({"text-anchor": "middle", "fill": "black"})
    .attr("font-family", "Roboto")
    .text(function(d) {return d.name})
    .attr("fill-opacity", 0)
    //.transition().delay(2000).duration(1500)
    .attr("fill-opacity", 1)
  ;

  gene.append("text") // pham name
    .style({"fill": "black"})
    .attr("font-family", "Roboto")
    .attr("x", function(d) { return ((d.stop - d.start)/2)/10;})
    .attr("y", function (d) {
      if (d.direction == "forward") {
        if (d.name % 2 === 0) { // forward and even
          return -10;
        }
        else { return -10;} // forward and odd
      }
      else if (d.direction == "reverse") {
        if (d.name % 2 === 0) { // reverse and even
          return 50;
        }
        else { return 50;} //reverse and odd
      }
    })
    .attr("text-anchor", function (d) {
      if ((d.stop - d.start) < 500 && d.direction === "forward") {
        return "start";
      }
      else if ((d.stop - d.start) < 500 && d.direction === "reverse") {
        return "end";
      }
      else {
        return "middle";
      }
    })
    .attr("transform", function (d) {
      if (d.stop - d.start < 500 && d.direction === "forward") {
        return "rotate(-90," + (5+(Math.abs(d.stop-d.start))/2/10) +  ",-10)";
      }
      else if (d.stop - d.start < 500 && d.direction === "reverse") {
        return "rotate(-90," + (d.stop-d.start)/2/10 + ",50)";
      }
      else {
        return "rotate(0)";
      }
    })

    .text(function(d) {return d.phamName})
    .attr("fill-opacity", 0)
    //.transition().delay(3500).duration(1500)
    .attr("fill-opacity", 1);

  phage.exit().remove();

};

Template.phages.onRendered(function () {
  console.log('phages rendered');



  $("#preloader").hide();
  $(document).ready(function(){
    $('ul.tabs').tabs();
  });
  $('.collapsible').collapsible({
    accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
  });
  $(document).ready(function(){
    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal-trigger').leanModal();
  });
  $('.dropdown-button').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrain_width: false, // Does not change width of dropdown to that of the activator
      hover: true, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: false, // Displays dropdown below the button
      alignment: 'left' // Displays dropdown with edge aligned to the left of button
    }
  );

  //Meteor.subscribe('genomes');
  svg = d3.select("#genome-map")
    .append("svg");

  Tracker.autorun(function () {
    setTimeout(drawGenomeMap(svg));
    $("#preloader").fadeOut(300).hide();

  });
  //Materialize.showStaggeredList('#cluster-cards')
});

var getclusters = function () {
  console.log("tracker autorun has rerun");
  Session.get("selections");
  var clusters = [];

  // get an array of all unique cluster names
  clusterNames = _.uniq(Genomes.find({}, {
    sort: {cluster: 1}, fields: {cluster: true}
  }).fetch().map(function (x) {
    return x.cluster;
  }), true);
  //console.log("cluster names: ", clusterNames);

  // for each cluster, get an array of unique subcluster names
  clusterNames.forEach(function (cluster, index, array) {
    //console.log(cluster);
    subClusterNames = _.uniq(Genomes.find({cluster: cluster}, {
      fields: {subcluster: true}
    }).fetch().map(function (x) {
      //return {'cluster': x.cluster, 'subcluster': x.subcluster, 'phagename': x.phagename};
      return x.subcluster;
    }), false);

    //console.log(cluster, subClusterNames);
    subClusterNames.sort(function (a, b) {
      return a - b;
    });
    subClusterNames.forEach(function (subcluster, index, array) {
      phageNames = Genomes.find({
        cluster: cluster,
        subcluster: subcluster
      }, {fields: {phagename: true}}).fetch().map(function (x) {
        return x.phagename
      });
      console.log(phageNames);
      var singletonator = function () {
        if (cluster === "") {
          return {"name": "Singletons", "cluster": "Singletons", "subcluster": "", phageNames: phageNames}
        }
        else {
          return {"name": cluster + subcluster, "cluster": cluster, "subcluster": subcluster, phageNames: phageNames}
        }
        };
        singletonator();
        var singletonated = singletonator(this)
        clusters.push(singletonated);
      });


  });
  return clusters;
};

Template.phages.helpers({
  clusters: function () { return getclusters(); },
  selectedGenomes: selectedGenomes
});

Template.phages.events({

  "change .clusterCheckbox": function (event, template) {
    console.log("cluster checkbox checked: ", event.target.id);
    console.log(event.target["id"]);
    console.log();
    console.log(event.target.getAttribute("data-subcluster"));
    $("#preloader").show(function () {
      if (event.target.id !== "Singletons") {
        clusterGenomes = Genomes.find({cluster: event.target.getAttribute("data-cluster"), subcluster: event.target.getAttribute("data-subcluster")}).fetch();
      }
      else {
        clusterGenomes = Genomes.find({cluster: "Singletons", subcluster: ""}).fetch();
      }
      clusterGenomes.forEach( function (element, index, array) {
        if (event.target.checked) {
          console.log("I should be selecting", element);
          selectedGenomes.upsert({phagename: element.phagename}, {
            phagename: element.phagename,
            genomelength: element.genomelength,
            cluster: element.cluster,
            subcluster: element.subcluster
          });
        }
        else {
          selectedGenomes.remove({phagename: element.phagename});
        }
      });
    });
  },
  "change .phageCheckbox": function (event, template) {
    $("#preloader").show(function () {
      // get a list of all phagenames on the client
      phagename = event.target.id.split("-")[0];
      //console.log(event);
      //Session.set("selections", selections++);

      // if user just selected a phage, it doesn't yet exist on the client but should
      if (event.target.checked) {
        console.log(phagename, 'was selected');
        p = Genomes.findOne({phagename:phagename});
        selectedGenomes.upsert({phagename:p.phagename}, {
          phagename:p.phagename,
          genomelength:p.genomelength});

      }
      // if user just unselected a phage, it exists on the client but shouldn't
      else {
        console.log(phagename, 'was unselected');
        //Genomes.update({"phagename":phagename},{selected: false});
        selectedGenomes.remove({"phagename":phagename});
      }
    });
  },
  "click .downloadGenomeMap": function (event, template) {
    console.log("downloadGenomeMap clicked");
    svg = d3.select("#genome-map").select("svg");
      var a = d3.select("#genome-map").append("a").node();
      a.download = 'phamerator_map.svg'; // file name
      xml = (new XMLSerializer()).serializeToString(svg.node()); // convert node to xml string
      a.href = 'data:application/octet-stream;base64,' + btoa(xml); // create data uri
      ev = document.createEvent("MouseEvents");
      ev.initMouseEvent("click", true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(ev);
  }
});

Template.registerHelper('clusterIsChecked',function(cluster, subcluster) {
  //if (input === "Singletons") { input = ""; }
  phagesInCluster = Genomes.find({cluster: cluster, subcluster: subcluster}, {fields: {"phagename": 1}}).fetch();
  r = true;
  phagesInCluster.forEach(function (phage, phageIndex, myPhageArray) {
    if (selectedGenomes.find({"phagename": phage.phagename}).count() == 0) {
      r = false;
    }
  });
  return r;
});

Template.registerHelper('phageIsChecked',function(input){
  return selectedGenomes.find({"phagename": input}).count() > 0;
});