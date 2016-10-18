var colorsys = require('colorsys');
var pathset = [];

function findElement(arg) {
  //console.log(arg, this, (arg.query === this.query && arg.subject === this.subject));
  return (arg.query === this.query && arg.subject === this.subject);
}

Array.prototype.diff = function(a) {
  return this.filter(function(element, index, array) {
    return !(a.find(findElement, element));
  });
};

selectedGenomes = new Meteor.Collection(null);
alignedGenomes = new Meteor.Collection(null);

Template.phages.onCreated(function() {
  Meteor.call('getclusters', function(error, result) {

    if (typeof error !== 'undefined') {
      console.log('error getting clusters:', error);
    }
    else {
      Session.set('myMethodResult', result);
    }
  });

  //Meteor.subscribe('genomes');
  console.log("phages template created");
  Meteor.startup(function () {
    Meteor.subscribe('selectedData', function () {
      names = Meteor.user().selectedData.genomeMaps;
      Meteor.subscribe("genomesWithSeq", names, {
        onReady: function () {
          //console.log("names:", names);
          names.forEach(function(value, index, myArray) {
            //console.log("value:", value);
            xx = Genomes.find({phagename: value}, {fields: {phagename: 1, genomelength: 1, sequence: 1, cluster: 1, subcluster: 1}}).fetch();
            //console.log("xx:", xx);
            xx.forEach(function(p, i, a) {
              //console.log("restoring saved", p);
              selectedGenomes.upsert({phagename: p.phagename}, {
                phagename: p.phagename,
                genomelength: p.genomelength,
                sequence: p.sequence,
                cluster: p.cluster,
                subcluster: p.subcluster
              });
            });
          });
        }
      });

    });
  });
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

//in rendered callback
var key = function(d) {
  return d.phagename;
};

blast = function(q, d) {
  var query = q;
  var subject = d;
  //console.log("query:", query, "subject:", subject, phagedata.length);
  var s1 = query.sequence;
  var s2 = subject.sequence;
  console.log("s1:", s1.length);
  console.log("s2:", s2.length);
  //if (phagedata.length < 2) {
  //  drawBlastAlignments([]);
  //  return;
  //}
  //s1 = phages[0].sequence;
  //s2 = phages[1].sequence;
  //myURL = "http://phage.csm.jmu.edu:8080/";
  myURL = "http://phamerator.org:3000/";
  //myURL = "http://phamerator.org:8080/";
  //myURL = "http://localhost:8080/";
  //console.log(myURL);
  console.log("aligning", query.phagename, subject.phagename);
  $.ajax({
    type: "POST",
    method: "POST",
    url: myURL,
    data: {seq1: s1, seq2: s2, name1: query.phagename, name2: subject.phagename},
    dataType: 'json',
    jsonp: false,
    success: function (data) {
      //console.log("data:", data);
      alignedGenomes.insert({"query": query.phagename, "subject": subject.phagename});
      drawBlastAlignments(data);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("ERROR:", textStatus, errorThrown);
    }
  });
};

drawBlastAlignments = function (json) {
  //d3.json(jsonData, function(error, json) {
    //console.log(json);
  pathset.length = 0;

  var data = function(queryName, subjectName, hsps) {
    if (queryName === "" || subjectName === "") {return; }
    console.log('drawing BLAST alignments for ', queryName, "and", subjectName);

    var paths = Array();
    hsps.forEach(function(value, index, myArray) {
      var dataset = Array();
      dataset.push({x: value.query_from/10, y: 180, id: queryName+subjectName+value.evalue+value.query_from+value.query_to,  queryName: queryName, subjectName: subjectName, evalue: value.evalue});
      dataset.push({x: value.query_to/10, y: 180});
      dataset.push({x: value.hit_to/10, y: 450});
      dataset.push({x: value.hit_from/10, y: 450});

      pathset.push(dataset);

      /*if (pathset.filter(function(e, index, array) { return e[0] && e[0].id == dataset[0].id; },arg).length === 0) {
        if (arg[0]) {
          console.log(arg[0].id, dataset[0].id);
        }
        pathset.push(dataset);
      }
      else {
        console.log("not adding " + e + " because already in " + dataset);
      }*/
      //path.push(dataset);
    });
    return paths;
  };
  if (json &&
      json.BlastOutput2 &&
      json.BlastOutput2.report &&
      json.BlastOutput2.report.results &&
      json.BlastOutput2.report.results.bl2seq[0] &&
      json.BlastOutput2.report.results.bl2seq[0].hits[0] &&
      json.BlastOutput2.report.results.bl2seq[0].hits[0].hsps) {
        var blasthsps = json.BlastOutput2.report.results.bl2seq[0].hits[0].hsps;
        var queryName = json.BlastOutput2.report.results.bl2seq[0].query_title;
        var subjectName = json.BlastOutput2.report.results.bl2seq[0].hits[0].description[0].title;
      }
  else {
    console.log("no valid json found");
    var blasthsps = [];
    var queryName = "";
    var subjectName = "";
    var query = "";
    return; // I'm new here!!!
  }
  data(queryName, subjectName, blasthsps);
  //console.log("pathset:", pathset);
  var hsps = d3.select("svg").select("g#"+queryName).insert("g", ":first-child").classed("hsp", true).selectAll(".hsps")
    .data(pathset, function (d) {
      //console.log(d[0].id);
      return d[0].id;
    });

  var hspsEnter = hsps.enter().insert("g", ":first-child");
    var d3line2 = d3.svg.line()
      .x(function(d) {
        return d.x;
      })
      .y(function(d,i) {
        return (d.y - 150);
      })
      .interpolate("linear-closed");
    hspsEnter
      .insert("svg:path", ":first-child");
      /*.attr("transform", function (d) {
        var t = d3.transform(d3.select('#'+d[0].queryName).attr("transform")),
          x = t.translate[0],
          y = t.translate[1];
          return "translate(" + x + "," + y + ")";
      })*/
      hsps.selectAll("path")
      .classed("hsps", true)
      .on("mouseover", function(d){
        d3.select(this).style("stroke", "black");
        //d3.select(this).style("stroke-width", 3);
        tooltip.html("e-value:" + d[0].evalue.toExponential(3));
        //tooltip.html(d[0].queryName + ":" + d[0].subjectName);
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
        //console.log("d:", d);
        //console.log("evalue:", evalue);
        array1 = evalue.split('e');
        exp = array1[array1.length - 1];
        exp = Math.abs(+exp);
        if (exp == 0.0) { hue = 1.0; }
        else {
          hue = exp / 200.0;
        }
        //console.log("hue", hue);
        hue = Math.min(hue, 0.75);

        hexcolor = colorsys.hsv_to_hex({ h: hue*360, s: 100, v: 100 });
        //console.log("hexcolor:", hexcolor);
        return hexcolor;
      })
      .style("fill-opacity", 0.3);

    hsps//.on("mouseout", function(){d3.select(this).style("fill", "red");})
      .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
      .on("mouseout", function(){
        //d3.select(this).style("stroke", "black");
        d3.select(this).style("stroke", "green");
        return tooltip.style("visibility", "hidden");
      });

  oldhsps = hsps.exit();
  if (oldhsps.length > 0) {
    tooltip.style("visibility", "hidden");
    oldhsps.transition().duration(1000).attr("opacity", 0).remove();
  }
};


Template.phages.onRendered(function () {
  console.log('phages rendered');

  $("#preloader").fadeOut(300).hide();
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
      stoppropagation: true,
      alignment: 'left' // Displays dropdown with edge aligned to the left of button
    }
  );

  //Meteor.subscribe('genomes');
  svg = d3.select("#genome-map")
    .append("svg");
  svg.attr("id", "svg-genome-map")

  Tracker.autorun(function () {
    //console.log("In tracker.autorun block");
    //if (typeof drawMapTimeout !== "undefined") { console.log("clearing timeout"); clearTimeout(drawMapTimeout); }
    //else { console.log("no timeout defined"); }
    //drawMapTimeout = setTimeout(function () {console.log("waiting...");}, 1000);
    //drawMapTimeout = setTimeout(drawGenomeMap(svg),15000);
    $("#preloader").fadeOut(300).hide();
    console.log("tracker autorun has rerun");
    //console.log("in drawGenomeMap");
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

    phage = svg.selectAll(".phages")
      .data(function() {
        pnames = selectedGenomes.find({}, {sort: {phagename:1}}).fetch().map(function(obj){ return obj.phagename;});
        phages = Genomes.find({phagename: {$in: pnames}}, {sort: {cluster:1, subcluster:1, phagename:1}});
        //todo: get selected primary and secondary sort fields and ascending/descending
        return phages.fetch();
      }, key);

    phage
      .attr("transform", function (d, i) {
        return "translate(0," + ((i * 300)+150) + ")";
      });

    newPhages = phage.enter().append("g")
      .attr("id", function(d, i){ return d.phagename; })
      .classed("phages", true)
      //.transition().duration(0)
      .attr("transform", function (d, i) {
        d.ypos = (i * 300) + 150;
        return "translate(0," + ((i * 300)+150) + ")";
      })
      .each(function(d) {
        var previousPhage = null;
        var nextPhage = null;
        selectedGenomes.find({}, {sort: {cluster: 1, subcluster: 1, phagename: 1}}).fetch().findIndex(function (element, index, thearray) {
          //console.log("checking ", d, element.phagename, element.cluster, element.subcluster);
          if ( element.phagename === d.phagename ) {
            //console.log("found", element, "at index:", index);
            //if (index > 0) {
            selectedPhages = selectedGenomes.find().fetch();
            if (selectedPhages.indexOf(element.phagename) > 0) {
              //console.log("previousPhage: ", previousPhage);
              previousPhage = thearray[index - 1];
            }
            else {
              //console.log("this is the first selected phage, so no alignment to do with this as subject");
            }
            if (index < selectedGenomes.find().fetch().length - 1) {
              //console.log("nextPhage: ", nextPhage);
              nextPhage = thearray[index + 1 ];
            }
            else {
              //console.log("this is the last selected phage, so no alignment to do with this as query");
            }
          }
        });
        if (previousPhage != null) {
          console.log("submitting blast for ", previousPhage, "and ", d);
          blast(previousPhage, d);
          var previousPhage = null
        }
        if (nextPhage != null) {
          console.log("submitting blast for ", d, "and ", nextPhage);
          blast(d, nextPhage);
          var nextPhage = null;
        }
      });

    var drag = d3.behavior.drag()
      .on("dragstart", function(d){
        console.log('dragstart:', d);
        var hsps = d3.selectAll(".hsps");
        hsps.transition().duration(1000).style("opacity", 0);
        setTimeout( function () {
          console.log("removing hsps for", "g#" + d.phagename, "because it is dragged query");
          d3.select("g#" + d.phagename).selectAll(".hsps").remove();
        }, 1000);

        // get any HSPs where this genome is the subject, and remove them
        var query;
        var queryObj = alignedGenomes.findOne({subject: d.phagename});
        if (queryObj) { query = queryObj.query; };
        setTimeout( function () {
          if ( query != null ) {
            //console.log("removing hsps for", "g#" + query, "because the subject was dragged");
            d3.select("g#" + query).selectAll(".hsps").remove();
          }
        }, 1000);

        alignedGenomes.remove({query: d.phagename});
        alignedGenomes.remove({subject: d.phagename});
        //do some drag start stuff...
      })
      .on("drag", function(d){
        //console.log('drag');
        if (d3.event.y > d.ypos) {
          //console.log("dragging down");
        }
        else {
          //console.log("dragging up");
        }
        d.ypos = d3.transform(d3.select(this).attr("transform")).translate[1];

        d3.select(this).attr("transform", function( d, i ) {
          return "translate(0," + (d3.event.y + 120) + ")";
        });

        //hey we're dragging, let's update some stuff
      })
      .on("dragend", function(d){
        console.log('dragend');
        d3.selectAll(".phages").sort( function(a,b) {
          //console.log(a.phagename, a.ypos, b.phagename, b.ypos);
          return a.ypos - b.ypos;
        })
        // just added this...
        .transition().duration(1500)
        .attr("transform", function (d, i) {
          d.ypos = (i * 300) + 150;
          return "translate(0," + ((i * 300)+150) + ")";
        });
        setTimeout(function () {
          alignedGenomes.remove({query: d.phagename});
          alignedGenomes.remove({subject: d.phagename });
          var phages = d3.selectAll(".phages").data();
          var genome_pairs = [];
          phages.forEach(function(d, i) {
            var c = phages[ i - 1 ];
            if ( c && d ) {
              genome_pairs.push({query: c.phagename, subject: d.phagename});
              if (alignedGenomes.find({query: c.phagename, subject: d.phagename}).count() === 0) {
                //console.log("submitting blast for ", c.phagename, "and", d.phagename);
                blast(c, d);
                alignedGenomes.insert({"query": c.phagename, "subject": d.phagename});
              }
              //else { console.log("skipping alignment for", c.phagename, "and", d.phagename); }
            }
          });
          //console.log("alignedGenomes:", alignedGenomes.find().fetch());
          //console.log("genome_pairs:", genome_pairs);
          alignedGenomes.find().fetch().diff(genome_pairs).forEach( function (v, i, a) {
            alignedGenomes.remove({query: v.query, subject: v.subject});
            d3.select("g#" + v.query).selectAll(".hsps").remove();
            //d3.select("g#" + v.subject).selectAll(".hsps").remove();
            //console.log("removing hsps for", "g#" + v.query, "and", "g#" + v.subject, "because no longer paired on map");
           });
          var hsps = d3.selectAll(".hsps");
          hsps.transition().duration(1000).style("opacity", 1);
        }, 1500);
      });

    phagedata = phage.data();
    console.log("phages:", phagedata);

    newPhages.append("text")
      .attr("x", 0)
      .attr("y", -120)
      .classed("phagename", true)
      .attr("font-family", "Arial")
      .attr("font-size", "24px")
      .attr("fill", "black")
      .style("text-anchor", "start")
      .text(function (d) {
        if (d.cluster === "") {
          return d.phagename + " (Singleton)";
        }
        return d.phagename + " (" + d.cluster + d.subcluster + ")";
      })
      .attr({"fill-opacity": 0})
      .transition().delay(1500).duration(2000)
      .attr({"fill-opacity": 1});
      newPhages.call(drag);

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
        else { return 70;}
      }
    };

    gene
      .attr("transform", function (d) { return "translate(" + gene_group_x(d) + "," + gene_group_y(d) + ")"});
    gene.append("rect")
      .on("click", function (d) {
        console.log(d);
        Session.set('selectedGene', nodedata.phagename + " gp" + d.name);
        $('#geneData').openModal();
      })
      .attr("height", function (d) {return 30;})
      .style({"stroke":"black", "stroke-width": "2px"})
      .attr("fill", function (d) {
        return d.phamColor;
      })
      .attr("width", 0)
      .transition()
      .duration(1600)
      .attr("width", function (d) { return (d.stop-d.start)/10; });


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
      .attr("font-family", "Roboto-Regular")
      .text(function(d) {return d.name})
      .attr("fill-opacity", 0)
      //.transition().delay(2000).duration(1500)
      .attr("fill-opacity", 1)
    ;

    gene.append("text") // pham name
      .style({"fill": "black"})
      .attr("font-family", "Roboto-Regular")
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
    phage.order();

    //if (selectedGenomes.find().count() !== 0) {setTimeout(Materialize.toast('genome map updated!', 1500), 500)}
  });
});

//clusters = Meteor.call('getclusters');
/*var getclusters = function () {

  console.log("getting clusters...");
  Session.get("selections");
  var clusters = [];

  // get an array of all unique cluster names
  clusterNames = _.uniq(Genomes.find({}, {
    sort: {cluster: 1}, fields: {cluster: true}, reactive: false
  }).fetch().map(function (x) {
    return x.cluster;
  }), true);
  console.log("got cluster names");

  // for each cluster, get an array of unique subcluster names
  clusterNames.forEach(function (cluster, index, array) {
    //console.log(cluster);
    subClusterNames = _.uniq(Genomes.find({cluster: cluster}, {
      fields: {subcluster: true}, reactive: false
    }).fetch().map(function (x) {
      //return {'cluster': x.cluster, 'subcluster': x.subcluster, 'phagename': x.phagename};
      return x.subcluster;
    }), false);

    console.log("got subclusters");
    subClusterNames.sort(function (a, b) {
      return a - b;
    });
    console.log("sorted subclusters");
    subClusterNames.forEach(function (subcluster, index, array) {
      phageNames = Genomes.find({
        cluster: cluster,
        subcluster: subcluster
      }, {fields: {phagename: true}, reactive: false}).fetch().map(function (x) {
        return x.phagename
      });
      console.log("got phage names");
      var singletonator = function () {
        if (cluster === "") {
          return {"name": "Singletons", "cluster": "", "subcluster": "", phageNames: phageNames}
        }
        else {
          return {"name": cluster + subcluster, "cluster": cluster, "subcluster": subcluster, phageNames: phageNames}
        }
        };
        singletonator();
        var singletonated = singletonator(this);
        clusters.push(singletonated);
      });


    });
  return clusters;

  };*/

updateSessionStore = function () {
  console.log('updating selected data');
  //console.log('names:', selectedGenomes.find({}, {fields: {phagename: 1}}).fetch().map(function (p) {return p.phagename;}));
  Meteor.user().selectedData['genomeMaps'] = selectedGenomes.find({}, {fields: {phagename: 1}}).fetch().map(function (p) {return p.phagename;});
};

Template.phages.helpers({
  clusters: function() {
    return Session.get('myMethodResult');
  },
  selectedGenomes: selectedGenomes,
  selectedGene: function () { return Session.get('selectedGene'); }
});

Template.phages.events({

  "change .clusterCheckbox": function (event, template) {
    console.log("event", event.target.checked);
    //console.log(selectedGenomes.find().count());
    if (event.target.checked) {Materialize.toast('drawing genome map...', 1000)}
    console.log("cluster checkbox checked: ", event.target.id);
    pathset.length = 0;

    $("#preloader").show(function () {
      if (event.target.id !== "Singletons") {
        clusterGenomes = Genomes.find({cluster: event.target.getAttribute("data-cluster"), subcluster: event.target.getAttribute("data-subcluster")}).fetch();
      }
      else {
        clusterGenomes = Genomes.find({cluster: "", subcluster: ""}).fetch();
      }
      clusterPhageNames = clusterGenomes.map(function (obj) {return obj.phagename});
      Meteor.subscribe("genomesWithSeq", clusterPhageNames, {
        onReady: function () {
          clusterGenomes = Genomes.find({cluster: event.target.getAttribute("data-cluster"), subcluster: event.target.getAttribute("data-subcluster")}).fetch();

          clusterGenomes.forEach( function (element, index, array) {
            if (event.target.checked) {

              console.log("getting sequence for", element);
              selectedGenomes.upsert({phagename: element.phagename}, {
                phagename: element.phagename,
                genomelength: element.genomelength,
                sequence: element.sequence,
                cluster: element.cluster,
                subcluster: element.subcluster
              }, function () {
                  Meteor.call('updateSelectedData', element.phagename, true);
                });
            }
            else {
              console.log('removing', element.phagename);
              selectedGenomes.remove({phagename: element.phagename}, function () { Meteor.call('updateSelectedData', element.phagename, false); });
            }
          });
        }
      });

    });
  },
  "change .phageCheckbox": function (event, template) {
    pathset.length = 0;
    $("#preloader").show(function () {
      // get a list of all phagenames on the client
      phagename = event.target.id.split("-")[0];
      //console.log(event);
      //Session.set("selections", selections++);

      // if user just selected a phage, it doesn't yet exist on the client but should
      Meteor.subscribe("genomesWithSeq", [phagename], {
        onReady: function () {
          if (event.target.checked) {
            console.log(phagename, 'was selected');
            p = Genomes.findOne({phagename: phagename});
            selectedGenomes.upsert({phagename: p.phagename}, {
              phagename: p.phagename,
              genomelength: p.genomelength,
              sequence: p.sequence,
              cluster: p.cluster,
              subcluster: p.subcluster
            }, function () { Meteor.call('updateSelectedData', phagename, true); });
          }
          // if user just unselected a phage, it exists on the client but shouldn't
          else {
            console.log(phagename, 'was unselected');
            //Genomes.update({"phagename":phagename},{selected: false});
            selectedGenomes.remove({"phagename":phagename},function () { Meteor.call('updateSelectedData', phagename, false); });
          }
        }
      });
    });
  },
  
  "click .downloadGenomeMap": function (event, template) {
    console.log("downloadGenomeMap clicked");

      $("svg").attr({ version: '1.1' , xmlns:"http://www.w3.org/2000/svg"});

      var svgData = $("#svg-genome-map")[0].outerHTML;
      var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
      var svgUrl = URL.createObjectURL(svgBlob);
      var downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = "phamerator_map.svg";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
  /*"click .downloadGenomeMap": function (event, template) {
    console.log("downloadGenomeMap clicked");
    svg = d3.select("#genome-map").select("svg");
      var a = d3.select("#genome-map").append("a").node();
      a.download = 'phamerator_map.svg'; // file name
      xml = (new XMLSerializer()).serializeToString(svg.node()); // convert node to xml string
      a.href = 'data:application/octet-stream;base64,' + btoa(xml); // create data uri
      ev = document.createEvent("MouseEvents");
      ev.initMouseEvent("click", true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(ev); */
  },
  "click #clearSelection": function (event, template){
        console.log("clearSelection clicked");
        selectedGenomes.remove({});
        Meteor.call('updateSelectedData', "", true)
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

Template.cluster.helpers({
  selectedCount: function (cluster, subcluster) {
    count = selectedGenomes.find({cluster: cluster, subcluster:subcluster}).count();
    if ( count === 0) {
      return "";
    }
    return count;
  },
  selectedClass: function(cluster, subcluster) {
    count = selectedGenomes.find({cluster: cluster, subcluster:subcluster}).count();
    if ( count === 0) {
      return "badge";
    }
    return "new badge";
  },
  dataBadgeCaption: function(cluster, subcluster) {
    count = selectedGenomes.find({cluster: cluster, subcluster:subcluster}).count();
    if ( count === 0) {
      return "";
    }
    else if ( count === 1) {
      return "selected genome";
    }
    return "selected genomes";
  }
});
