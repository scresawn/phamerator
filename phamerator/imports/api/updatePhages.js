import { adjust_skew } from './adjust_skew.js';
import { adjust_skew_all } from './adjust_skew_all.js';
import { update_hsps } from './updateHsps';
import { blast } from './blast.js';

export let blastAlignmentsOutstanding = 0;

export const update_phages = () => {
  console.log("update_phages()");
  phamsObj = Session.get('phamsObj');
  //console.log('phamsObj:', phamsObj)
  //d3.selectAll(".phages").exit().remove();
  pnames = selectedGenomes.find({}, {sort: {phagename:1}}).fetch().map(function(obj){ return obj.phagename;});
  // /pnames = Genomes.find({sequence: {$exists: true}}, {sort: {phagename:1}}).fetch().map(function(obj){ return obj.phagename;});
  phages = Genomes.find({phagename: {$in: pnames}}, {sort: {cluster:1, subcluster:1, phagename:1}});
  //todo: get selected primary and secondary sort fields and ascending/descending

  phageArray = phages.fetch();
  phageArray.forEach( p => {
    p.selector = p.phagename.replace(/\./g, '_dot_');
  })

  phage = mapGroup.selectAll(".phages")
    .data(phageArray, function(d) {
      return d.phagename;
    });
  phage.exit().remove();

  phagedata = phage.data();

  d3.selectAll(".functionLabel")
    .transition()
    .duration(d3.max([500, phagedata.length * 20]))
    .delay(3000)
    .attr("opacity", function () {
      if (Session.get("showFunctionLabels") === true) {
        return 1;
      }
      else {
        return 0;
      }
    });

    d3.selectAll(".generect")
    //.transition()
    //.duration(d3.max([500, phagedata.length * 20]))
        .attr("fill", function (d, i) {
            if (Session.get("colorByPhamAbundance") === true) {
                phamSize = phamsObj[+d.phamName];
                /*rgb = colorsys.hsv_to_rgb(0.66, 0.0, 1-min(1,(5*scaledAbundance))) #(scaledAbundance+(abundance/largestPhamSize))) # orphams should be white for consistency
                 rgb = (rgb[0]*255,rgb[1]*255,rgb[2]*255)
                 return '#%02x%02x%02x' % rgb
                    */
                scaledAbundance = phamSize/maxPham;
                //abundancecolorsys=colorsys.hsv_to_rgb({h:0.66, s:0.0, v:1-Math.min(1,(5*scaledAbundance))});
                return ("hsl(0.66,0%," + (1-(scaledAbundance))*100 + "%)");

            }
            else if (Session.get("colorByPhams") === true) {
              return d.phamColor;
            }
            else if (Session.get("colorByConservedDomains") === true) {
              //console.log(i);
              return (d.domainCount === 0) ? "white" : "orange"
            }
        })
        .attr("opacity", function (d) {
          return "1";
        });

  d3.selectAll(".geneNameLabel")
    .style("fill", function (d) {
      if (Session.get("showphamabcolor") === true) {
        phamSize = phamsObj[+d.phamName];
        scaledAbundance = phamSize/maxPham;
        //console.log("scaledAbundance:", scaledAbundance);
        if (scaledAbundance > 0.5) {
          return "white";
        }
        return "black";
      }
     })
     .attr('opacity', 0)
     .transition()
     .duration(1000)
     .delay(2000)
     .attr('opacity', 1);

  d3.selectAll(".phamLabel")
    .attr('opacity', 0)
    .transition()
    .delay(2000)
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
  //d3.select("#genome-map").attr("height", function(d) {return (selectedGenomes.find().count() * 305) });
  svgMap.attr("height", function(d) {return (selectedGenomes.find().count() * 305) });
  // /svgMap.attr("height", function(d) {return (Genomes.find({sequence: {$exists: true}}).count() * 305) });

  //console.log ("minX", minX, "maxX", maxX);
  //mapGroup.attr("transform", function(d) {"return translate(" + -minX + ",0)"})
  var draggedGenome = d3.select(this);
  var minX = 0;
  var maxX = 0;
  var phages = d3.selectAll(".phages");
  phages.each(function (d) {
    var minX = Math.min(minX, d3.transform(d3.select(this).attr("transform")).translate[0]);
    var maxX = Math.max(maxX, d3.transform(d3.select(this).attr("transform")).translate[0] + (d.genomelength/10));
  });
    svgMap.attr("width", function (d) {
    return (maxX - minX);
  })
  .attr("x", function (d) { return minX });

  // Define the div for the tooltip
  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

setTimeout(() => {
  newPhages = phage.enter().append("svg:g")
    .attr("id", function(d, i){ return "phage_" + d.selector; })
    .classed("phages", true);
    //.attr("ypos", function (d, i) {
    //  d.ypos = (i * 300)+150;
    //  console.log("setting:", d.phagename, d.ypos);
    //  return (i * 300)+150;
    //});
  //.transition().duration(0)

  var minX = 0;
  var maxX = 0;
  var phages = d3.selectAll(".phages");
  phages.each(function (d) {
    //console.log(d, this);
    minX = Math.min(minX, d3.transform(d3.select(this).attr("transform")).translate[0]);
    maxX = Math.max(maxX, d3.transform(d3.select(this).attr("transform")).translate[0] + (d.genomelength/10));
  });

    svgMap.attr("width", function (d) {
    return (maxX - minX);
  })
  .attr("x", function (d) { return minX });
  svgMap.selectAll(".phages")
    .sort(function (a,b) {
      //console.log("sorting");
      //console.log(a, b);
      var ay = d3.transform(d3.select('g#phage_' + a.selector).attr("transform")).translate[1];
      var by = d3.transform(d3.select('g#phage_' + b.selector).attr("transform")).translate[1];
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
      //console.log('d:', d)
      return "translate(" + d3.transform(d3.select('g#phage_' + d.selector).attr("transform")).translate[0]
 + "," + ((i * 300)+150) + ")";
    });

  var drag = d3.behavior.drag()
    //.origin(function(d,i) { return {x:0, y:d3.transform(d3.select(this).attr("transform")).translate[1]}; })
    .origin(function(d,i) {
      //console.log("origin:", d3.transform(d3.select(this).attr("transform")).translate);
      return {x:d3.transform(d3.select(this).attr("transform")).translate[0], y:d3.transform(d3.select(this).attr("transform")).translate[1]}; })

    .on("dragstart", function(d){
      dragging = this;
      if (!d3.event.sourceEvent.shiftKey) {
        d3.selectAll(".hspGroup")
        .transition().delay(200).duration(500)
        .style("opacity", 0)
      }
    })
    .on("drag", function(d) {

      //console.log("d3.event.x:", d3.event.x);
      //d.xpos = d3.transform(d3.select(this).attr("transform")).translate[1];
      d.ypos = d3.transform(d3.select(this).attr("transform")).translate[1];

      if (d3.event.sourceEvent.shiftKey) {
        adjust_skew(dragging);
      }
      else {
        // vertical dragging
        d3.select(this)
          .attr("transform", function(d) {
            return "translate(" + d3.transform(d3.select(this).attr("transform")).translate[0] + "," + (d3.event.y) + ")";
        });
      }
    })
    .on("dragend", function(d) {
      // get all genomes and then get the transformed x position of the one farthest to the left
      console.log('update_phages called from dragend')

      //update_phages();
      if (d3.event.sourceEvent.shiftKey) {
        // console.log('adjust_skew_all 225')
        // adjust_skew_all();
      }

      else {
        //setTimeout(() => {M.toast({html: 'Aligning the reordered genomes...', completeCallback: () => {M.toast({html: 'Done!'})}})}, 0);

        //console.log("vertical dragend");
        // move the vertically dragged/dropped genome back to the left edge of the map, so that hsps are in the right place
        //d3.select(this).attr("transform", function (d, i) {
      //    return "translate(" + 0 + "," + d3.transform(d3.select(this).attr("transform")).translate[1] + ")";
        //});
      d3.selectAll(".phages")
        .sort(function (a,b) {
          var ay =   d3.transform(d3.select('g#phage_' + a.selector).attr("transform")).translate[1];
          var by =   d3.transform(d3.select('g#phage_' + b.selector).attr("transform")).translate[1];
          return ay - by;
        })
        .transition().duration(1000)
        .attr("transform", function (d, i) {
          d.ypos = (i * 300) + 150;

          return "translate(" + d3.transform(d3.select(this).attr("transform")).translate[0] + "," + ((i * 300)+150) + ")";
        });

        phagesdata = d3.selectAll(".phages").data();
        var hspGroupData = d3.selectAll(".hspGroup").data();

       var genome_pairs = [];
       blastAlignmentsOutstanding = phagesdata.length - (hspGroupData.length + 1);

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
        console.log('update_hsps() called from drag_end()')
        setTimeout(update_hsps, 1500, hspData); // update after horizontal drop
      }
    });

  phagedata = phage.data();

  newPhageNames = newPhages.append("svg:text");
    newPhageNames
    //.attr("x", 0)
    //.attr("y", -120)
    .classed("phagename", true)
    .attr('position', 'fixed')
    //.attr("font-family", "Arial")
    .attr("font-size", "24px")
    .attr("fill", "black")
    .style("text-anchor", "start")
    .attr("position", "fixed")
    .attr("transform", "translate(0,-120)")
.text(function (d) {
      if (d.cluster === "") {
        return d.phagename + " (Singleton)";
      }
      return d.phagename + " (" + d.cluster + d.subcluster + ")";
    })
    /*.attr({"opacity": 0})
    .transition().delay(1500).duration(2000)*/
    .attr({"opacity": 1});
  newPhages.call(drag);

  newPhages.append("svg:rect") // background for ruler
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
    .append("svg:g");
  group.append("svg:rect")
    .style({"fill": "black"})
    .attr({
      x: function (d) {
        return d / 10;
      }, y: 0, width: "1px", height: 30
    })
    // .attr({"opacity": 0})
    // .transition().duration(1500)
    // .attr({"opacity": 1});

  group.append("svg:text") // kbp label
    .attr("x", function (d) {
      return (d / 10) + 3;
    })
    .attr("y", 12)
    //.attr("font-family", "sans-serif")
    .attr("font-size", "14px")
    .attr("fill", "green")
    .style("text-anchor", "start")
    .text(function (d) {
      return d / 1000;
    })
    // .attr({"opacity": 0})
    // .transition().duration(1500)
    // .attr({"opacity": 1});
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
    .append("svg:g");
  group2.append("svg:rect")
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
    .append("svg:g");
  group3.append("svg:rect")
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
    .data(function(d, i) {
      //console.log('selectAll(.gene) data binding', d, i)
       return d.genes;})
    .enter()
    .append("svg:g");

  /*gene.each(function (d)
  {
      domaingroup = this;
  });*/
    /*gene.each(function (d) {
        console.log(this, "this2");
        domaingroup = this;
        Meteor.call("get_number_of_domains", d.geneID, domaingroup, function(error, result){
            if (result != null) {
               d3.selectAll(".generect").filter(function(d){
                   console.log(d, result);
                 return d.geneID === result.geneID;
               })


                    .style("stroke", function(){
                        console.log(result);
                    console.log(d.geneID, result.domainsCount, domaingroup);
                    return (result.domainsCount === 0) ? "red" : "black"
                }
                )
            }
        })
        }
    );*/

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
  gene.append("svg:rect")
      .classed("generect", true)
    .on("click", function (d, i) {

      console.log(d);

      // Initialize the dialog to empty strings and arrays, rather than showing old data while waiting for new
      selectedDomains = [];
      Session.set("selectedDomains", selectedDomains);
      selectedClusterMembers = [];
      Session.set('selectedClusterMembers', selectedClusterMembers);
      Session.set('selectedGeneNotes', "");
      Session.set('selectedGene', "");
      Session.set('selectedProtein', "");
      Session.set("selectedGeneTitle", "");

      nodedata = d3.select(this).node().parentNode.parentNode.__data__;
      //console.log("d:", d);
      Session.set("selectedGeneTitle", nodedata.phagename + " gene " + d.name + " (" + d.start + " - " + d.stop + " )" + " | pham " + d.phamName );

      //Modify these to be reactive to screen size
      var phamWidth = 500;
      var phamHeight = 100;
      var phamAALength = Math.abs(d.stop-d.start)/3.0;

      svgDomain
          .append("svg:g")
          .attr("class", "domainVis")
          .append("svg:rect") // 'gene' rect
          .attr("height", phamHeight)
          .attr("width", phamWidth)
          .attr("fill", d.phamColor)
          .attr("stroke", "black")
          .attr("stroke-width", 5)
          //.attr("transform", "translate(5,5)")
      ;

    Meteor.call("get_domains_by_gene", d.geneID, dataset, function (error, selectedDomains) {
        Session.set('selectedDomains', selectedDomains);

        console.log('selectedDomains:', selectedDomains);
        function numOfDomains () {return selectedDomains.length;}
        var numberOfDomains = numOfDomains();

        svgDomain
            .append("svg:g")
            .attr("class", "domainVis")
            .selectAll(".domainRects")
            .data(selectedDomains)
            .enter()
            .append("svg:rect") // 'domain' rect
            .attr("height", (phamHeight-20)/(numberOfDomains))
            //Need to make responsive to screen width
            .attr("width", function (d){return (Math.abs(d.query_end - d.query_start)/phamAALength)*phamWidth;})
            .attr("fill", "#ffbd88")
            .attr("stroke", "black")
            .attr("transform", function(d,i){return "translate("+ (((d.query_start-1)/phamAALength)*phamWidth) +","+ (10+(i*((phamHeight-20)/numberOfDomains))) +")";})
            .on("mouseover", function(d) {
                d3.select(this).style({"stroke": "black", "stroke-width": "4"});
                d3.select("#" + d.domainname + ".collapsible-header").style({"font-weight": "bold"})})
            .on("mouseout", function(d) {
                d3.select(this).style({"stroke": "black", "stroke-width": "1"});
                d3.select("div#" + d.domainname + ".collapsible-header").style({"font-weight": "normal"})})
            .on("click", function (d) {
                d3.select("li#" + d.domainname).classed("active", !d3.select("li#" + d.domainname).classed("active"));
                if (d3.select("div#" + d.domainname).attr("class") === "active collapsible-header")
                {
                    d3.select("div#" + d.domainname).classed("active collapsible-header", false);
                    d3.select("div#" + d.domainname).classed("collapsible-header", true);
                    d3.select("div#" + d.domainname + ".collapsible-body").style({"display": "none"})
                }
                else
                {
                    d3.select("div#" + d.domainname).classed("collapsible-header", false);
                    d3.select("div#" + d.domainname).classed("active collapsible-header", true);
                    d3.select("div#" + d.domainname + ".collapsible-body").style({"display": "block"})
                }
            });
    });

    Meteor.call("get_clusters_by_pham", dataset, d.phamName, function (error, selectedClusterMembers) {
        Session.set('selectedClusterMembers', selectedClusterMembers);
        console.log('selectedClusterMembers:', selectedClusterMembers);
        uniqueClusters = _.uniq(selectedClusterMembers);
        Session.set('selectedClusters', uniqueClusters);
      });
      Meteor.subscribe('proteinSeq', nodedata.phagename, {
        onReady: function () {
          Session.set('selectedProtein', ">" + nodedata.phagename + " gp" + d.name + "\n" + d.translation);
    }
      });

      var g = selectedGenomes.findOne({phagename: nodedata.phagename}, {fields: {sequence: 1}}).sequence;
      // /var g = Genomes.findOne({phagename: nodedata.phagename, sequence: {$exists: true}}, {fields: {sequence: 1}}).sequence;
      Session.set('selectedGeneNotes', d.genefunction);
      if (d.direction === "forward") {
        Session.set('selectedGene', ">" + nodedata.phagename + " gene " + d.name + "\n" + g.slice(d.start-1, d.stop));
      }
      else {
        complementSeq = g.slice(d.start-1, d.stop).split('').reverse().map(complement).join('');
        Session.set('selectedGene', ">" + nodedata.phagename + " gp" + d.name + "\n" + complementSeq);
      }

        var onModalClose = function (){
        d3.selectAll("g.domainVis").remove();
      }
        ;

      $('#geneData').modal('open');
      $('#geneData')[0].M_Modal.options.complete = onModalClose;

    })
    .attr("height", function (d) {return 30;})
      .style({"stroke":"black", "stroke-width": "1px"})
      .attr("id", function(d) {
          return d.geneID
      })

      .style({"stroke-width": "1px"})
      .attr("fill", function (d) {
          //console.log("running colorchange");
          if (Session.get("colorByPhams") === true) {
              return d.phamColor
          }
          else if (Session.get("colorByPhamAbundance") === true) {
            phamSize = phamsObj[+d.phamName];
            /*rgb = colorsys.hsv_to_rgb(0.66, 0.0, 1-min(1,(5*scaledAbundance))) #(scaledAbundance+(abundance/largestPhamSize))) # orphams should be white for consistency
             rgb = (rgb[0]*255,rgb[1]*255,rgb[2]*255)
             return '#%02x%02x%02x' % rgb
                */
            scaledAbundance = phamSize/maxPham;
            //abundancecolorsys=colorsys.hsv_to_rgb({h:0.66, s:0.0, v:1-Math.min(1,(5*scaledAbundance))});
            return ("hsl(0.66,0%," + (1-(scaledAbundance))*100 + "%)");

          }
          else if (Session.get("colorByConservedDomains") === true) {
            return (d.domainCount === 0) ? "white" : "orange"
          }
      })
    // .attr("width", 0)
    // //.attr("rx", 2)
    // .transition()
    // .duration(1600)
    .attr("width", function (d) { return (d.stop-d.start)/10; })
    .attr('opacity', 0)
    .transition()
    .duration(2000)
    .delay(function (d, i) { return i * 10 })
    .attr('opacity', 1)


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

  gene.append("svg:text") // gene name
    .classed("geneNameLabel", true)
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
    //.attr("font-family", "Roboto-Regular")
    .text(function(d) {return d.name})
        //FOR TEXT OPACITY AFTER PHAM COLOR SWITCH

    //.attr("opacity", 0)
    //.transition().delay(2000).duration(1500)
    .attr("opacity", 1);

  gene.append("svg:text") // gene function
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
    //.attr("font-family", "Roboto-Regular")
    .attr("font-size", "11px")
    .text(function(d) {return d.genefunction; })
    //.attr("opacity", 0)
    //.transition().delay(2000).duration(1500)
    .attr("opacity", function (d) {
      if (Session.get("showFunctionLabels") === true) { return 1; }
      else { return 0; }
    });

  gene.append("svg:text") // pham name
    .classed("phamLabel", true)
    .style({"fill": "black"})
    //.attr("font-family", "Roboto-Regular")
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


  phagesdata = svgMap.selectAll(".phages").data();
  var hspGroupData = svgMap.selectAll(".hspGroup").data();

  var genome_pairs = [];
  blastAlignmentsOutstanding = phagesdata.length - (hspGroupData.length + 1);

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
  });

  tempAlign = alignedGenomes.find().fetch();
  tempAlign.diff(genome_pairs).forEach( function (v, i, a) {

    hspData = hspData.filter(function(e, j, b) {
      //console.log("e:", e, "v:", v, !((e.queryName === v.query) && (e.subjectName === v.subject)));
      return !((e.queryName === v.query) && (e.subjectName === v.subject));
    });

    alignedGenomes.remove({query: v.query, subject: v.subject});
  });
  //console.log('update_hsps called from update_phages()')
  //setTimeout(update_hsps, 1500, hspData); // from updatePhages.js
  }, 0)
  console.log('appending documentFragment')
  svgMap.node().appendChild(documentFragment);

}
