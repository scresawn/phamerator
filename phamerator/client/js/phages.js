import Clipboard from 'Clipboard';

var clipboard = new Clipboard('.btn-copy-link');
clipboard.on('success', function(e) {
  console.log(e);
  Materialize.toast('sequence copied!', 1000);
  e.clearSelection();
});

var blastAlignmentsOutstanding = 0;

Session.set("clustersExpanded", false);
Session.set("showFunctionLabels", true);
Session.set("showPhamLabels", true);
Session.set("showhspGroups", true);

function viewMapTabClicked () {
  if (Session.get("geneTranslation")) {
    $('.tap-target').tapTarget('open');
  }
}

function reSort() {
  body.selectAll("div.data").sort(function(a, b) {
    if ((a.favorite) && !(b.favorite)) {
      return 1;
    }
    else if (b.favorite && !(a.favorite)) {
      return -1;
    }
    if (a.cluster < b.cluster) {
      return -1;
    }
    else if (a.cluster > b.cluster) {
      return 1;
    }
    else if (+a.subcluster !== +b.subcluster) {
      return +a.subcluster - +b.subcluster;
    }
    else if (a.phagename < b.phagename) {
      //console.log(a.phagename, b.phagename, a.phagename < b.phagename);
      return -1;
    }
    else { return 1; }
  })
    .transition().duration(500)
    .style({
      top: function(d, i) {
        return 60 + ((i*30)) + "px";
      }
    })
}

var colorsys = require('colorsys');
hspData = [];
var d3line2 = d3.svg.line()
  .x(function(d) {
    return d.x;
  })
  .y(function(d,i) {
    return (d.y);
  })
  .interpolate("linear-closed");

function complement(a) {
  return { A: 'T', T: 'A', G: 'C', C: 'G' }[a];
}

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

function update_hsps(hspData) {
  console.log("update_hsps:", hspData);
  hspGroup = svg.selectAll(".hspGroup")
    .data(hspData, function (d) {
      return d.queryName + "___" + d.subjectName;
    });
  hspGroup.exit().remove();

  d3.selectAll(".hsp")
    .transition()
    .delay(1000)
    .duration(1000)
    .style("opacity", function () {
      if (Session.get("showhspGroups") === true) {
        return 0.3;
      }
      else {
        return 0;
      }
    });

  hspGroup.enter().insert("g", ":first-child")
    .classed("hspGroup", true)
    .attr("id", function (d) {
      console.log("appending phage group");

      i = 0;
      animate();
      function animate() {
        i == 0 && requestAnimationFrame(animate);
        Session.set("progressbarState", ((phagesdata.length - blastAlignmentsOutstanding) / phagesdata.length) * 100 + "%");
        //console.log("blastAlignmentsOutstanding: ", blastAlignmentsOutstanding);
        //console.log(i);
        i++;
      }

      return "phage_" + d.queryName + "___phage_" + d.subjectName;
    })
    .each(function (d) {
      var hsps = svg.selectAll("g#phage_" + d.queryName + "___phage_" + d.subjectName + ".hspGroup")
        .selectAll(".hsp")
        .data(function(d) {
          return d.genome_pair_hsps;
        });
      hspsEnter = hsps.enter();
      hspsEnter
        .insert("svg:path", ":first-child")
        .classed("hsp", true)
        .on("mouseover", function(d) {
          d3.select(this).style("stroke", "black");
          //d3.select(this).style("stroke-width", 3);
          tooltip.html("e-value:" + d[0].evalue.toExponential(3) + "<br>" + d[0].identity + "/" + d[0].align_len + " (" + d3.format("0.000%")(d[0].identity/d[0].align_len) + ")");
          //tooltip.html(d[0].queryName + ":" + d[0].subjectName);
          tooltip.style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY + 50) + "px")
            .style("opacity", 0)
            .transition()
            .duration(250)
            .style("opacity", 1);
          return tooltip.style("visibility", "visible");
        })
        //.style("opacity", 0)
        .style("stroke-width", 0)
        .attr("d", function(d) { //console.log(d);
          return d3line2(d);})
        .style("fill", function (d) {
          /////console.log(d);
          evalue = d[0].evalue.toString();

          array1 = evalue.split('e');
          exp = array1[array1.length - 1];
          exp = Math.abs(+exp);
          if (exp == 0.0) { hue = 1.0; }
          else {
            hue = exp / 200.0;
          }
          hue = Math.min(hue, 0.75);

          hexcolor = colorsys.hsv_to_hex({ h: hue*360, s: 100, v: 100 });
          return hexcolor;
        })
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .delay(3000)
        //.style("stroke", "black")


        .style("opacity", function() {
          if (Session.get("showhspGroups") === true) {
            return 0.3
          }
          else {
            return 0;
          }
        })
        .style("visibility", function() {
          if (Session.get("showhspGroups") === true) {
            return "visible";
          }
          else {
            return "hidden";
          }
        }); //.on("mouseout", function(){d3.select(this).style("fill", "red");})
      hsps.on("mousemove", function() {
        if (d3.event.pageX < (d3.select("#svg-genome-map").attr("width")/2)) {
          return tooltip.style("top", (d3.event.pageY + 20) + "px").style("left", (d3.event.pageX) + "px");
        }
        else {
          return tooltip.style("top", (d3.event.pageY + 20) + "px").style("left", (d3.event.pageX - 150) + "px");
        }
      })
        .on("mouseout", function() {
          d3.select(this).style("stroke", "green");
          tooltip
            .style("opacity", 0);
          return tooltip.style("visibility", "hidden");
        });
    });

  hspGroup
    .attr("transform", function (d) {
      if (d3.select('g#phage_'+d.queryName)[0][0] !== null) {
        var t = d3.transform(d3.select('g#phage_' + d.queryName).attr("transform")),
          x = t.translate[0],
          y = t.translate[1] - 150;
        return "translate(" + x + "," + y + ")";
      }
    });

  if (Session.get("showhspGroups") === true) {
    d3.selectAll(".hspGroup").transition().duration(1000).style("opacity", 1);
  }
}
var phageArray = [];
var map_order = [];

function update_phages() {
  console.log("update_phages()");
  //d3.selectAll(".phages").exit().remove();
  pnames = selectedGenomes.find({}, {sort: {phagename:1}}).fetch().map(function(obj){ return obj.phagename;});
  phages = Genomes.find({phagename: {$in: pnames}}, {sort: {cluster:1, subcluster:1, phagename:1}});
  //todo: get selected primary and secondary sort fields and ascending/descending

  phageArray = phages.fetch();

  phage = svg.selectAll(".phages")
    .data(phageArray, function(d) {
      return d.phagename;
    });
  phage.exit().remove();

  phagedata = phage.data();


  d3.selectAll(".functionLabel")
    .transition()
    .duration(d3.max([500, phagedata.length * 20]))
    .attr("opacity", function () {
      if (Session.get("showFunctionLabels") === true) {
        return 1;
      }
      else {
        return 0;
      }
    });

  d3.selectAll(".phamLabel")
    .transition()
    .duration(d3.max([500, phagedata.length * 20]))
    .attr("opacity", function () {
      if (Session.get("showPhamLabels") === true) {
        return 1;
      }
      else {
        return 0;
      }
    });

  $("#preloader").fadeOut(300).hide();
  //console.log("in drawGenomeMap");
  svg.attr("height", function(d) {return (selectedGenomes.find().count() * 305) });
  svg.attr("width", function (d) {
    return d3.max(selectedGenomes.find().fetch(), function(d) {
      return d.genomelength/10;
    })
  });

  // Define the div for the tooltip
  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  //phage
  //  .attr("transform", function (d, i) {
  //    return "translate(0," + ((i * 300)+150) + ")";
  //  });

  newPhages = phage.enter().append("g")
    .attr("id", function(d, i){ return "phage_" + d.phagename; })
    .classed("phages", true);
    //.attr("ypos", function (d, i) {
    //  d.ypos = (i * 300)+150;
    //  console.log("setting:", d.phagename, d.ypos);
    //  return (i * 300)+150;
    //});
  //.transition().duration(0)

  svg.selectAll(".phages")
    //.sort( function(a,b) {
    //  console.log(d3.selectAll(".phages").filter(phagename === a.phagename).attr("cx"));

    //  console.log(a.phagename, a.ypos, b.phagename, b.node().attr("ypos"));
    //  return a.ypos - b.ypos;
    //})
    //.attr("ypos", function (d, i) {
      //d.ypos = (i * 300)+150;
    //  return (i * 300)+150;
    //})
    .sort(function (a,b) {
      //console.log("sorting");
      //console.log(a, b);
      var ay = d3.transform(d3.select('g#phage_' + a.phagename).attr("transform")).translate[1];
      var by = d3.transform(d3.select('g#phage_' + b.phagename).attr("transform")).translate[1];
      //console.log(a.phagename, ay, b.phagename, by);

      // if both are old, sort by position (new genomes will be at position 0)
      if (ay > 0 && by > 0) {
        return ay - by;
      }

      // else if either or both are new, sort by cluster, then subcluster, then phagename
      else {
        if (a.cluster < b.cluster) {
          return -1;
        }
        else if (a.cluster > b.cluster) {
          return 1;
        }
        else if (+a.subcluster !== +b.subcluster) {
          return +a.subcluster - +b.subcluster;
        }
        else if (a.phagename < b.phagename) {
          //console.log(a.phagename, b.phagename, a.phagename < b.phagename);
          return -1;
        }
        else { return 1; }
      }
    })
    //.transition()
    //.duration(500)
    .attr("transform", function (d, i) {
      return "translate(0," + ((i * 300)+150) + ")";
    });

  /*phage
    .each(function(d) {
      var previousPhage = null;
      var nextPhage = null;
      selectedGenomes.find({}, {sort: {cluster: 1, subcluster: 1, phagename: 1}}).fetch().findIndex(function (element, index, thearray) {
        //console.log("checking ", d, element.phagename, element.cluster, element.subcluster);
        if ( element.phagename === d.phagename ) {
          selectedPhages = selectedGenomes.find().fetch();
          if (selectedPhages.find(function (e, i, a, element) { return e.phagename === this.phagename; }) !== undefined) {
            previousPhage = thearray[index - 1];
          }
          else {
            /////console.log("this is the first selected phage, so no alignment to do with this as subject");
          }
          if (index < selectedGenomes.find().fetch().length - 1) {
            nextPhage = thearray[index + 1 ];
          }
          else {
            /////console.log("this is the last selected phage, so no alignment to do with this as query");
          }
        }
      });
      if (previousPhage != null) {
        /////console.log("submitting blast for ", previousPhage, "and ", d);
        //blast(previousPhage, d);
        previousPhage = null
      }
      if (nextPhage != null) {
        /////console.log("submitting blast for ", d, "and ", nextPhage);
        //blast(d, nextPhage);
        nextPhage = null;
      }
    });*/

  var drag = d3.behavior.drag()
    .origin(function(d,i) { return {x:0, y:d3.transform(d3.select(this).attr("transform")).translate[1]}; })


    .on("dragstart", function(d){

      d3.event.sourceEvent.stopPropagation();
      //if (d.attr("phage"))
      d3.selectAll(".hspGroup").transition().duration(1000).style("opacity", 0);
      //d3.select("svg").selectAll(".hspGroup").style("opacity", 0);
      /////console.log("removing hsps for", "g#" + d.phagename, "because it is dragged query");
      /*hspData = hspData.filter(function(e, i, a) {
        /////console.log("e:", e, !((e.queryName === phagename) || (e.subjectName === phagename)));
        return !((e.queryName === d.phagename) || (e.subjectName === d.phagename));
      });
      alignedGenomes.remove({query: d.phagename});
      alignedGenomes.remove({subject: d.phagename});*/

    })
    .on("drag", function(d){

      d.ypos = d3.transform(d3.select(this).attr("transform")).translate[1];

      d3.select(this)
        //.attr("ypos", function (d, i){
        //  d.ypos = (d3.event.y + 120);
        //  return (d3.event.y + 120);
        //})
        .attr("transform", function( d, i ) {
          return "translate(0," + (d3.event.y) + ")";
      });
    })
    .on("dragend", function(d){
      d3.selectAll(".phages")

        .sort(function (a,b) {
          var ay = d3.transform(d3.select('g#phage_' + a.phagename).attr("transform")).translate[1];
          var by = d3.transform(d3.select('g#phage_' + b.phagename).attr("transform")).translate[1];
          return ay - by;
        })
        .transition().duration(1000)
        .attr("transform", function (d, i) {
          d.ypos = (i * 300) + 150;
          return "translate(0," + ((i * 300)+150) + ")";
        });

        phagesdata = d3.selectAll(".phages").data();
        var hspGroupData = d3.selectAll(".hspGroup").data();

       var genome_pairs = [];

        //Session.set("blastAlignmentsOutstanding", phagesdata.length - hspGroupData.length - 1);
        //blastAlignmentsOutstanding = phagesdata.length - hspGroupData.length -1;
        phagesdata.forEach(function(d, i) {
          var c = phagesdata[ i - 1 ];
          if ( c && d ) {
            genome_pairs.push({query: c.phagename, subject: d.phagename});
            if (alignedGenomes.find({query: c.phagename, subject: d.phagename}).count() === 0) {
              console.log("submitting blast for ", c.phagename, "and", d.phagename);
              blast(c, d);
            }
            else {
              //console.log("skipping alignment for", c.phagename, "and", d.phagename);
            }
          }
        });

        tempAlign = alignedGenomes.find().fetch();
        tempAlign.diff(genome_pairs).forEach( function (v, i, a) {

          hspData = hspData.filter(function(e, j, b) {
            return !((e.queryName === v.query) && (e.subjectName === v.subject));
          });

          alignedGenomes.remove({query: v.query, subject: v.subject});
        });
        //window.requestAnimationFrame(function () {
        //  console.log("update_hsps 415");
        //  update_hsps(hspData);
        //});
        setTimeout(update_hsps, 1500, hspData);
    });

  phagedata = phage.data();

  newPhageNames = newPhages.append("text");
    newPhageNames.attr("x", 0)
    .attr("y", -120)
    .classed("phagename", true)
    .attr("font-family", "Arial")
    .attr("font-size", "24px")
    .attr("fill", "black")
    .style("text-anchor", "start")
    .attr("position", "fixed")
.text(function (d) {
      if (d.cluster === "") {
        return d.phagename + " (Singleton)";
      }
      return d.phagename + " (" + d.cluster + d.subcluster + ")";
    })
    .attr({"opacity": 0})
    .transition().delay(1500).duration(2000)
    .attr({"opacity": 1});
  newPhages.call(drag);

  newPhages.append("rect") // background for ruler
    .attr({
      x: 0, y: 0, width: function (d) {
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
    .attr({"opacity": 0})
    .transition().duration(1500)
    .attr({"opacity": 1});

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
    .attr({"opacity": 0})
    .transition().duration(1500)
    .attr({"opacity": 1});
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
    .attr({"opacity": 0})
    .transition().duration(1500)
    .attr({"opacity": 1});
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
    .attr("opacity", 0)
    .transition().duration(1500)
    .attr("opacity", 1);

  gene = newPhages.selectAll(".genes")
    .data(function(d, i) { return d.genes;})
    .enter()
    .append("g");

    /*.on("mouseover", function(d) {
      nodedata = this.parentNode.__data__;
      div.transition()
        .duration(500)
        .style("opacity", .9)
        .style("font-size", "12px");
      div.html(nodedata.phagename + " gp" + d.name + "<br>" + "phamily: " + d.phamName + "<br>" + d.genefunction)

      // the text of the tooltip ...
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
      div.transition()
        .duration(500)
        .style("opacity", 0);
    });*/
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
    .on("click", function (d, i) {

      console.log(d, this, gene);
      nodedata = d3.select(this).node().parentNode.parentNode.__data__;
      //console.log("selected gene:", d);
      //console.log("d.parent:", d3.select(d));
      //nodedata = this.parentNode.__data__;
      Meteor.subscribe('proteinSeq', nodedata.phagename, {
        onReady: function () {
          Session.set('selectedProtein', ">" + nodedata.phagename + " gp" + d.name + "\n" + d.translation);
    }
      });

      var g = selectedGenomes.findOne({phagename: nodedata.phagename}, {fields: {sequence: 1}}).sequence;
      if (d.direction === "forward") {
        Session.set('selectedGene', ">" + nodedata.phagename + " gp" + d.name + "\n" + g.slice(d.start, d.stop));
      }
      else {
        complementSeq = g.slice(d.start, d.stop).split('').reverse().map(complement).join('');
        Session.set('selectedGene', ">" + nodedata.phagename + " gp" + d.name + "\n" + complementSeq);

      }


      $('#geneData').modal('open');
    })
    .attr("height", function (d) {return 30;})
    .style({"stroke":"black", "stroke-width": "1px"})
    .attr("fill", function (d) {
      return d.phamColor;
    })
    .attr("width", 0)
    .attr("rx", 2)
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
   .attr("opacity", 0)
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
   .attr("opacity", 0.9);*/

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
    //.attr("opacity", 0)
    //.transition().delay(2000).duration(1500)
    .attr("opacity", 1);

  gene.append("text") // gene function
    .classed("functionLabel", true)
    .attr("x", function(d) { return ((d.stop - d.start)/2)/10;})
    .attr("y", function (d) {
      if (d.direction == "forward") {
        if (d.stop - d.start < 500) {
          return -65;
        }
        else { return -45; }
      }
      else if (d.direction == "reverse") {
        if (d.stop - d.start < 500) {
          return 125;
        }
        else { return 85; }
      }
    })
    .style({"text-anchor": "middle", "fill": "black"})
    .attr("font-family", "Roboto-Regular")
    .attr("font-size", "11px")
    .text(function(d) {return d.genefunction; })
    //.attr("opacity", 0)
    //.transition().delay(2000).duration(1500)
    .attr("opacity", function (d) {
      if (Session.get("showFunctionLabels") === true) { return 1; }
      else { return 0; }
    });

  gene.append("text") // pham name
    .classed("phamLabel", true)
    .style({"fill": "black"})
    .attr("font-family", "Roboto-Regular")
    .attr("font-size", "9")
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

    .text(function(d) {
      //phamSize = Phams.findOne({"name": +d.phamName}).size;
      //phamSize = Session.get("phamsObj")[+d.phamName];
      phamSize = phamsObj[+d.phamName];
      //console.log(d.phamName, s);
      return d.phamName + " (" + phamSize +")";
      //return d.phamName;
    })
    .attr("opacity", function (d) {
      if (Session.get("showPhamLabels") === true) { return 1; }
      else { return 0; }
    });

  phage.exit().remove();
  //phage.order();
  /*phage.sort(function (a,b) {
    console.log(a, b);
    var ay = d3.transform(d3.select('g#' + a.phagename).attr("transform")).translate[1];
    var by = d3.transform(d3.select('g#' + b.phagename).attr("transform")).translate[1];
    //console.log(a.phagename, ay, b.phagename, by);
    return ay - by;
  });*/

  phagesdata = svg.selectAll(".phages").data();
  var hspGroupData = svg.selectAll(".hspGroup").data();
  //Session.set("blastAlignmentsOutstanding", phagesdata.length - hspGroupData.length - 1);
  //blastAlignmentsOutstanding = phagesdata.length - hspGroupData.length - 1;

  var genome_pairs = [];
  phagesdata.forEach(function(d, i) {
    var c = phagesdata[ i - 1 ];
    if ( c && d ) {
      genome_pairs.push({query: c.phagename, subject: d.phagename});
      if (alignedGenomes.find({query: c.phagename, subject: d.phagename}).count() === 0) {
        //console.log("submitting blast for ", c.phagename, "and", d.phagename);
        blast(c, d);
        //alignedGenomes.insert({"query": c.phagename, "subject": d.phagename});
      }
      else {
        //console.log("skipping alignment for", c.phagename, "and", d.phagename);
        }
    }
    /*window.requestAnimationFrame(function () {
      //console.log("drawBLASTalignments");
      update_hsps(hspData);
    });*/
    //setTimeout(update_hsps, 1500, hspData);
  });
  /*setTimeout(function () {
   //console.log("drawBLASTalignments");
   update_hsps(hspData);


   }, 10000);*/
  tempAlign = alignedGenomes.find().fetch();
  tempAlign.diff(genome_pairs).forEach( function (v, i, a) {

    hspData = hspData.filter(function(e, j, b) {
      //console.log("e:", e, "v:", v, !((e.queryName === v.query) && (e.subjectName === v.subject)));
      return !((e.queryName === v.query) && (e.subjectName === v.subject));
    });

    alignedGenomes.remove({query: v.query, subject: v.subject});
  });
  //console.log("dragend");
  //update_hsps(hspData);
  /*window.requestAnimationFrame(function () {
    console.log("update_hsps 793");
    update_hsps(hspData);
  });*/
  //setTimeout(update_hsps, 1000, hspData);

  //console.log("phagesdata:", phagesdata, "genome_pairs:", genome_pairs, "alignedGenomes:", alignedGenomes.find({}).fetch());

}

Template.phages.onCreated(function() {
  console.log('Template.phages.onCreated');

  /*if (typeof routeChange === "undefined") {
    console.log('initial load');
    Materialize.toast("Restoring your work...", 99999999999999, 'gray restoring-your-work-toast');
  }
  else {
    console.log('route change');
  }
  var routeChange = true;*/

  Meteor.call('getclusters', function(error, result) {

    if (typeof error !== 'undefined') {
     /////console.log('error getting clusters:', error);
    }
    else {
      Session.set('myMethodResult', result);
    }
  });

  Meteor.call('getphams', function(error, result) {

    if (typeof error !== 'undefined') {
      /////console.log('error getting clusters:', error);
    }
    else {
      Session.set('phamsObj', result);
      phamsObj = result;
    }
  });

  //Meteor.subscribe('genomes');
 /////console.log("phages template created");
  //Meteor.startup(function () {
    Meteor.subscribe('selectedData', function () {
      names = Meteor.user().selectedData.genomeMaps;
      if (names && names.length > 0) {
        //Materialize.toast("Restoring your work...", 99999999999999, '', function () {
          Meteor.subscribe("genomesWithSeq", names, {
            onReady: function () {
              names.forEach(function (value, index, myArray) {
                //console.log("value:", value);
                xx = Genomes.find({phagename: value}, {
                  fields: {
                    phagename: 1,
                    genomelength: 1,
                    sequence: 1,
                    cluster: 1,
                    subcluster: 1
                  }
                }).fetch();
                //console.log("xx:", xx);
                xx.forEach(function (p, i, a) {
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
      }
    });
});

var tooltip = d3.select("body")
  .append("div")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .style("background","lightcyan")
  .style("width","150px")
  .style("height", "50px")
  .style("text-align", "center")
  .style("position", "absolute")
  .style("padding", "2px")
  .style("font", "Arial")
  .style("border-radius","8px");

//in rendered callback

blast = function(q, d) {
  blastAlignmentsOutstanding = blastAlignmentsOutstanding + 1;

  var query = q;
  var subject = d;
  alignedGenomes.update({"query": query.phagename, "subject": subject.phagename}, {"query": query.phagename, "subject": subject.phagename}, {upsert: true});

  //console.log("query:", query, "subject:", subject, phagedata.length);
  var s1 = query.sequence;
  var s2 = subject.sequence;
 /////console.log("s1:", s1.length);
 /////console.log("s2:", s2.length);

  myURL = "http://phamerator.org:3000/";
  //console.log("aligning", query.phagename, subject.phagename);

  $.ajax({
    type: "POST",
    method: "POST",
    url: myURL,
    data: {seq1: s1, seq2: s2, name1: query.phagename, name2: subject.phagename},
    dataType: 'json',
    jsonp: false,
    success: function (data) {
      blastAlignmentsOutstanding = blastAlignmentsOutstanding - 1;
      drawBlastAlignments(blastAlignmentsOutstanding, data);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      blastAlignmentsOutstanding = blastAlignmentsOutstanding - 1;
      alignedGenomes.remove({"query": query.phagename, "subject": subject.phagename});
     /////console.log("ERROR:", textStatus, errorThrown);
    }
  });
};

drawBlastAlignments = function (blastAlignmentsOutstanding, json) {
  //d3.json(jsonData, function(error, json) {
    //console.log(json);
  //pathset.length = 0;
 //console.log("drawBlastAlignments called");

  var parseBlastResult = function(queryName, subjectName, hspsArray) {
    if (queryName === "" || subjectName === "") {return; }



    var genome_pair_hsps = [];
    hspsArray.forEach(function(value, index, myArray) {
      var hspCoordinates = Array();
      //console.log(value);
      hspCoordinates.push({x: value.query_from/10, y: 180, evalue: value.evalue, identity: value.identity, align_len: value.align_len});
      hspCoordinates.push({x: value.query_to/10, y: 180});
      hspCoordinates.push({x: value.hit_to/10, y: 450});
      hspCoordinates.push({x: value.hit_from/10, y: 450});
      genome_pair_hsps.push(hspCoordinates);
    });
    genome_pair_hsps.sort(function(a, b) {
      return a[0].align_len - b[0].align_len;
    });
    hspData.push({queryName: queryName, subjectName: subjectName, genome_pair_hsps: genome_pair_hsps});
  };

  var blasthsps = [];
  var queryName = "";
  var subjectName = "";

  if (json &&
      json.BlastOutput2 &&
      json.BlastOutput2.report &&
      json.BlastOutput2.report.results &&
      json.BlastOutput2.report.results.bl2seq[0] &&
      json.BlastOutput2.report.results.bl2seq[0].hits[0] &&
      json.BlastOutput2.report.results.bl2seq[0].hits[0].hsps) {
        blasthsps = json.BlastOutput2.report.results.bl2seq[0].hits[0].hsps;
        queryName = json.BlastOutput2.report.results.bl2seq[0].query_title;
        subjectName = json.BlastOutput2.report.results.bl2seq[0].hits[0].description[0].title;
  }
  else {
   console.log("no valid json found");
  }

  //console.log("drawBLASTalignments for ", queryName, subjectName);

  parseBlastResult(queryName, subjectName, blasthsps);

  if (blastAlignmentsOutstanding === 0) {
    window.requestAnimationFrame(function () {
      //console.log("drawBLASTalignments");
      $(".restoring-your-work-toast").fadeOut();

      setTimeout(update_hsps(hspData), 0);
      Session.set("progressbarVisibility", false);
      //setTimeout(Materialize.toast("Ready!", 2000), 5000);
    });
  }
  else {
    //console.log("blastAlignmentsOutstanding", Session.get("blastAlignmentsOutstanding"))

    i = 0;
    animate();
    function animate() {
      i == 0 && requestAnimationFrame(animate);
      Session.set("progressbarVisibility", true);
      Session.set("progressbarState", ((phagesdata.length - blastAlignmentsOutstanding) / phagesdata.length) * 100 + "%");
      //console.log("blastAlignmentsOutstanding: ", blastAlignmentsOutstanding);
      //console.log(i);
      i++;
    }
  }
};

Template.phages.onDestroyed(function () {
  $(document).ready(function() {
    console.log('Template.phages.onDestroyed');
    $('#mapSettings').remove();
    $('#geneData').remove();
  });

});

Template.phages.onRendered(function () {
  console.log('Template.phages.onRendered');

  // Reference: http://www.html5rocks.com/en/tutorials/speed/animations/

  var last_known_scroll_position = 0;
  var ticking = false;

  function doSomething(scroll_pos) {
    // do something with the scroll position
    console.log(scroll_pos);
  }

  var genome_map = d3.select("body").selectAll("svg");
  console.log(genome_map);

  genome_map.on('scroll', function(e) {
    console.log("scroll");
    last_known_scroll_position = window.scrollX;
    if (!ticking) {
      window.requestAnimationFrame(function() {
        doSomething(last_known_scroll_position);
        ticking = false;
      });
    }
    ticking = true;
  });

  $("#preloader").fadeOut(300).hide();
  $(document).ready(function() {
    $('ul.tabs').tabs();
    $('#mapSettings').modal();
    $('#geneData').modal();

    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    //$('.modal-trigger').leanModal();
    //$('.modal-trigger').modal();

    //$('#mapSettings').modal();
  });

  /*$('.dropdown-button').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrain_width: false, // Does not change width of dropdown to that of the activator
      hover: true, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: false, // Displays dropdown below the button
      stoppropagation: true,
      alignment: 'left' // Displays dropdown with edge aligned to the left of button
    });*/

  svg = d3.select("svg");
  svg.attr("id", "svg-genome-map")
    .attr("border", "50px");

  Tracker.autorun(function () {
    update_phages();
    update_hsps(hspData);
  });
  document.getElementById("viewMapTab").addEventListener ("click", viewMapTabClicked, false);
});

Template.cluster.onRendered(function () {
  $('.collapsible').collapsible({
    accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
  });

  $('li').find('.dont-collapse').unbind('click.collapse');
  $('li').find('.dont-collapse').on('click.collapse', function(e) {
    e.stopPropagation();
    console.log("suppressing collapse");
    $(e.target).trigger('favorites-click');
  });
});

updateSessionStore = function () {
 /////console.log('updating selected data');
  //console.log('names:', selectedGenomes.find({}, {fields: {phagename: 1}}).fetch().map(function (p) {return p.phagename;}));
  Meteor.user().selectedData['genomeMaps'] = selectedGenomes.find({}, {fields: {phagename: 1}}).fetch().map(function (p) {return p.phagename;});
};

Template.phages.helpers({
  clusters: function() {
    return Session.get('myMethodResult');
  },
  geneTranslation: function () { return Session.get('geneTranslation'); },
  selectedGenomes: selectedGenomes,
  selectedGene: function () { return Session.get('selectedGene'); },
  selectedProtein: function () { return Session.get('selectedProtein'); },
  genomes_are_selected: function() {
    return selectedGenomes.find({}).fetch().length > 0;
  },
  clusters_expanded: function () {
    return Session.get("clustersExpanded");
  }
});

Template.phages.events({

  "change .clusterCheckbox": function (event, template) {
   /////console.log("event", event.target.checked);
    //console.log(selectedGenomes.find().count());
    if (event.target.checked) {Materialize.toast('drawing genome map...', 1000)}
    console.log("cluster checkbox checked: ", event.target.id);

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
          //console.log(clusterGenomes);

          if (event.target.checked) {
            clusterGenomes.forEach(function (element, index, array) {
              //blastAlignmentsOutstanding = blastAlignmentsOutstanding + 1;

              /////console.log("getting sequence for", element);
              selectedGenomes.upsert({phagename: element.phagename}, {
                phagename: element.phagename,
                genomelength: element.genomelength,
                sequence: element.sequence,
                cluster: element.cluster,
                subcluster: element.subcluster
              }, function () {
                Meteor.call('updateSelectedData', element.phagename, true);
              });
            });
          }
          else {
            //Session.set("progressbarVisibility", false);

            clusterGenomes.forEach( function (element, index, array) {

                /////console.log('removing', element.phagename);
              hspData = hspData.filter(function(e, i, a) {
                return !((e.queryName === element.phagename) || (e.subjectName === element.phagename));
              });
                selectedGenomes.remove({phagename: element.phagename}, function () {
                  alignedGenomes.remove({query: element.phagename}, function () {
                    alignedGenomes.remove({subject: element.phagename}, function () {
                      //blastAlignmentsOutstanding = blastAlignmentsOutstanding - 1;
                      Meteor.call('updateSelectedData', element.phagename, false);
                      window.requestAnimationFrame(function () {
                        //console.log("update_hsps 1088");
                        update_hsps(hspData);
                      });
                      //update_hsps(hspData);
                    });
                  });
                });
            });
          }
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
            //Session.set("progressbarVisibility", false);
            console.log(phagename, 'was unselected');
            //console.log("before:", hspData);
            hspData = hspData.filter(function(e, i, a) {
              //console.log("e:", e, !((e.queryName === phagename) || (e.subjectName === phagename)));
              return !((e.queryName === phagename) || (e.subjectName === phagename));
            });
            //console.log("after:", hspData);
            selectedGenomes.remove({"phagename":phagename},function () {
              alignedGenomes.remove({query: phagename}, function () {
              alignedGenomes.remove({subject: phagename}, function () {
                //blastAlignmentsOutstanding = blastAlignmentsOutstanding - 1;
                Meteor.call('updateSelectedData', phagename, false);
                  window.requestAnimationFrame(function () {
                    //console.log("update_hsps 1136");
                    update_hsps(hspData);
                  });
                  //update_hsps(hspData);
                });
              });
            });
          }
        }
      });
    });
  },

  "favorites-click": function (event, template) {
    console.log(event.target.id, "clicked");
    var fav = d3.select("#"+event.target.id);
    if (!fav.classed("favorite")) {
      Meteor.call('updateSubclusterFavorites', event.target.id, true);
      fav.classed("favorite", true);
      fav.classed("yellow-text", true);
      fav.classed("grey-text", false);
    }
    else {
      Meteor.call('updateSubclusterFavorites', event.target.id, false);
      fav.classed("favorite", false);
      fav.classed("yellow-text", false);
      fav.classed("grey-text", true);
    }
  },
  
  "click .downloadGenomeMap": function (event, template) {
   /////console.log("downloadGenomeMap clicked");

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
  },

  "click .mapSettings": function (event, template) {
    event.preventDefault();

    $('#mapSettings').modal('open');
  },

  "change #functionLabelsSwitch": function (event, template) {
    event.preventDefault();
    console.log(event.target.checked);
    setTimeout(function () { Session.set("showFunctionLabels", event.target.checked) }, 200);
  },

  "change #phamLabelsSwitch": function (event, template) {
    event.preventDefault();
    console.log(event.target.checked);
    setTimeout(function () { Session.set("showPhamLabels", event.target.checked) }, 200);
  },

  "change #hspGroupsSwitch": function (event, template) {
    event.preventDefault();
    console.log(event.target.checked);
    setTimeout(function () {
      Session.set("showhspGroups", event.target.checked);

      d3.selectAll(".hsp")
        .style("visibility", function () { return "visible"; })
        .transition()
        .delay(250)
        .duration(2000)
        .style("opacity", function () {
          if (Session.get("showhspGroups") === true) {
            return 0.3;
          }
          else {
            return 0;
          }
        })
        .transition().delay(2000)
        .style("visibility", function () {
          if (Session.get("showhspGroups") === true) {
            return "visible";
          }
          else {
            return "hidden";
          }
        });
    }, 200);
  },

  "click #clearSelection": function (event, template){
       /////console.log("clearSelection clicked");
    $('.fixed-action-btn').closeFAB();
    d3.select("#clearSelection")
          .transition()
          .duration(250)
          .style("opacity", 0).each("end", function () {
            selectedGenomes.remove({});
            alignedGenomes.remove({});
            hspData = [];
            Meteor.call('updateSelectedData', "", true);
          $('.fixed-action-btn').closeFAB();

        });
    svg.selectAll(".hspGroup").remove();
    //blastAlignmentsOutstanding = 0;
  },
  "click #expand_all": function (event, template) {
    $('.fixed-action-btn').closeFAB();
    d3.select("#expand_all")
      .transition()
      .duration(250)
      //.style("opacity", 0)
      .each("end", function () {
        $(".collapsible-header").addClass("active");
        $(".collapsible").collapsible({accordion: false});
        Session.set("clustersExpanded", true);
      });
  },
  "click #collapse_all": function (event, template) {
    $('.fixed-action-btn').closeFAB();
    d3.select("#collapse_all")
      .transition()
      .duration(250)
      //.style("opacity", 0)
      .each("end", function () {
        $(".collapsible-header").removeClass(function(){
          return "active";
        });
        $(".collapsible").collapsible({accordion: true});
        $(".collapsible").collapsible({accordion: false});
        Session.set("clustersExpanded", false);
      });
    $("html, body").animate({ scrollTop: 0 }, "slow");

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
    return "purple new badge";
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
  },
  favoriteSubcluster: function(cluster, subcluster) {
    //console.log(Meteor.user().selectedData.subclusterFavorites);
    if (Meteor.user() && Meteor.user().selectedData && Meteor.user().selectedData.subclusterFavorites) {
      var favs = Meteor.user().selectedData.subclusterFavorites;
      //console.log(cluster + subcluster, favs);
      if (cluster === "") {
        if (favs.indexOf("favorite-Singletons") < 0) {
          return "grey-text";
        }
      }
      else if (favs.indexOf("favorite-" + cluster + subcluster) < 0) {
        return "grey-text";
      }
      return "yellow-text favorite";
    }
  }
});

Template.mapSettingsModal.helpers({
  'blastSwitchState': function () {
    return Session.get("showhspGroups");
  },
  'phamLabelsSwitchState': function () {
    return Session.get("showPhamLabels");
  },
  'functionLabelsSwitchState': function () {
    return Session.get("showFunctionLabels");
  }
});
