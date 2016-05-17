selectedGenomes = new Meteor.Collection(null);

Template.phages.onCreated(function() {
  Meteor.subscribe('genomes');
});

Template.phages.onRendered(function () {
  console.log('phages rendered');
  $(document).ready(function(){
    $('ul.tabs').tabs();
  });
  $('.collapsible').collapsible({
    accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
  });

  //in rendered callback
  var key = function(d) {
    return d.phagename;
  };

  Meteor.subscribe('genomes');
  var svg = d3.select("#genome-map").append("svg");

  Tracker.autorun(function () {

    console.log("tracker autorun has rerun");
    Session.get("selections");

    svg.attr({height:function(d) {return (selectedGenomes.find().count() * 225) + 100 }});
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

    var phage = svg.selectAll("g")
      .data(function() {
        pnames = selectedGenomes.find({},{phagename:1}).fetch().map(function(obj){ return obj.phagename;});
        phages = Genomes.find({phagename: {$in: pnames}}, {sort: {phagename:1}});
        return phages.fetch();
      }, key);

    phage
      .enter()
      .append("g");

    phage.attr("transform", function (d, i) {
      return "translate(0," + (100 + (i * 225)) + ")";
    });

    phage.append("text")
      .attr("x", 0)
      .attr("y", -60)
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

    phage.append("rect") // background for ruler
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

    var group = phage.selectAll(".thousandticks")
      .data(function (d) {
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
    var group2 = phage.selectAll(".fivehundredticks")
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
    var group3 = phage.selectAll(".onehundredticks")
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

    /* FROM HERE */

    gene = phage.selectAll(".genes")
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
      console.log(d);
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
        if (d.direction == "forward") {
          return "aquamarine";
        }
        else if (d.direction == "reverse") {
          return "lightskyblue";
        }
        else {
          return "black";
        }
      })
      .attr("width", 0)
      .transition()
      .duration(1600)
      .attr("width", function (d) { return (d.stop-d.start)/10; })

    ;


    domain = gene.selectAll(".domains")
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
      .attr("fill-opacity", 0.9);

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
      .transition().delay(2000).duration(1500)
      .attr("fill-opacity", 1)
    ;

    gene.append("text") // pham name
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

      .style({"text-anchor": "middle", "fill": "black"})
      .attr("font-family", "Roboto")
      .text(function(d) {return d.pham})
      .attr("fill-opacity", 0)
      .transition().delay(3500).duration(1500)
      .attr("fill-opacity", 1);

  //});

    /* TO HERE */

    /*gene = phage.selectAll(".genes")
      .data(function (d, i) {
        //console.log(i, d);
        return d.genes;
      })
      .enter()
      .append("g");
    gene.append("rect")
      .attr("y", function (d) {
        if (d.direction == "forward") {
          if (d.name % 2 === 0) {
            return -70;
          }
          else {
            return -30;
          }
        }
        else if (d.direction == "reverse") {
          if (d.name % 2 === 0) {
            return 30;
          }
          else {
            return 60;
          }
        }
      })
      .attr("x", function (d) {
        if (d.direction === "forward") {
          return (0 - ((d.stop - d.start) / 10)) - 2;
        }
        else if (d.direction === "reverse") {
          w = d3.select("#genome-map").select("svg").style("width");
          return w;
        }
      })
      .attr("height", function (d) {
        return 30;
      })
      .attr("width", function (d) {
        return (d.stop - d.start) / 10;
      })
      .style({"stroke": "black", "stroke-width": "2px"})
      .attr("fill", function (d) {
        return d.phamColor;
      })
      .on("mouseover", function (d) {
        //console.log(d);
        div.transition()
          .duration(500)
          .style("opacity", .9);
        div.html("The direction of gene " + d.name + " is " + d.direction)// the text of the tooltip ...
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function (d) {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      })
      .transition().delay(1000).duration(1500)
      .attr("x", function (d) {
        return d.start / 10;
      });

    gene.append("text") // gene name
      .attr("x", function (d) {
        return ((d.start + d.stop) / 2) / 10;
      })
      .attr("y", function (d) {
        if (d.direction == "forward") {
          if (d.name % 2 === 0) { // forward and even
            return -50;
          }
          else {
            return -10;
          } // forward and odd
        }
        else if (d.direction == "reverse") {
          if (d.name % 2 === 0) { // reverse and even
            return 50;
          }
          else {
            return 80;
          } //reverse and odd
        }
      })
      .style({"text-anchor": "middle", "fill": "black"})
      .attr("font-family", "sans-serif")
      .text(function (d) {
        return d.name
      })
      .attr("fill-opacity", 0)
      .transition().delay(2000).duration(1500)
      .attr("fill-opacity", 1);

    gene.append("text") // pham name
      .attr("x", function (d) {
        return ((d.start + d.stop) / 2) / 10;
      })
      .attr("y", function (d) {
        if (d.direction == "forward") {
          if (d.name % 2 === 0) {
            return -80;
          }
          else {
            return -40;
          }
        }
        else if (d.direction == "reverse") {
          if (d.name % 2 === 0) {
            return 80;
          }
          else {
            return 110;
          }
        }
      })
      .style({"text-anchor": "middle", "fill": "blue"})
      .attr("font-family", "sans-serif")
      .text(function (d) {
        return d.pham
      })
      .attr("fill-opacity", 0)
      .transition().delay(3500).duration(1500)
      .attr("fill-opacity", 1);
      */
    phage.exit().remove();
  });
});


clusters = [
    {name: 'A1', phageNames: ['Bxb1', 'U2']},
    {name: 'A2', phageNames: ['Che12', 'D29', 'L5', 'Pukovnik']},
    {name: 'A3', phageNames: ['Bxz2', 'HelDan', 'JHC117', 'MarQuart', 'Spike509']}
  ];

phageNames = Genomes.find({}, {fields: {phagename:1}}).map(function(pn) { phageNames.push(pn.phagename); });
selections = 0;

Template.phages.helpers({
  //selections: selections,
  clusters: clusters,
  phageNames: phageNames,
  selectedGenomes: selectedGenomes
});

Template.phages.events({
  "change .clusterCheckbox": function (event, template) {
    console.log("cluster checkbox checked: ", event.target.id);
    clusterGenomes = Genomes.find({cluster: event.target.id}).fetch();
    clusterGenomes.forEach( function (element, index, array) {
      if (event.target.checked) {
        console.log("I should be selecting", element);
        selectedGenomes.upsert({phagename: element.phagename}, {
          phagename: element.phagename,
          genomelength: element.genomelength,
          cluster: element.cluster
        });
      }
      else {
          selectedGenomes.remove({phagename: element.phagename});
        }
    });
  },
  "change .phageCheckbox": function (event, template) {
    // get a list of all phagenames on the client
    phagename = event.target.id.split("-")[0];
    //console.log(event);
    Session.set("selections", selections++);

    // if user just selected a phage, it doesn't yet exist on the client but should
    if (event.target.checked) {
      console.log(phagename, 'was selected');
      p = Genomes.findOne({phagename:phagename});
      selectedGenomes.upsert({phagename:p.phagename}, {phagename:p.phagename, genomelength:p.genomelength});

    }
    // if user just unselected a phage, it exists on the client but shouldn't
    else {
      console.log(phagename, 'was unselected');
      //Genomes.update({"phagename":phagename},{selected: false});
      selectedGenomes.remove({"phagename":phagename});

    }
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

Template.registerHelper('isChecked',function(input){
  return selectedGenomes.find({"phagename":input}).count() > 0;
});