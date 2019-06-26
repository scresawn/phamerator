import { update_hsps } from '../../imports/updateHsps.js';
import { update_phages } from '../../imports/updatePhages.js';

Template.phages.events({
  "change .clusterCheckbox": function (event, template) {
   /////console.log("event", event.target.checked);
    //console.log(selectedGenomes.find().count());
    //if (event.target.checked) {Materialize.toast('drawing genome map...', 1000)}
    console.log("cluster checkbox checked: ", event.target.id);

    $("#preloader").show(function () {
      if (event.target.id !== "Singletons") {
        clusterGenomes = Genomes.find({cluster: event.target.getAttribute("data-cluster"), subcluster: event.target.getAttribute("data-subcluster")}).fetch();
      }
      else {
        clusterGenomes = Genomes.find({cluster: "", subcluster: ""}).fetch();
      }
      clusterPhageNames = clusterGenomes.map(function (obj) {return obj.phagename});
      //Tracker.autorun(function () {
        //genomesWithSeqHandle.stop()
        // Meteor.subscribe("genomesWithSeq", dataset, clusterPhageNames, {
        //   onReady: function () {
            //clusterGenomes = Genomes.find({cluster: event.target.getAttribute("data-cluster"), subcluster: event.target.getAttribute("data-subcluster")}).fetch();
            //console.log(clusterGenomes);

          if (event.target.checked) {
            clusterGenomes.forEach(function (element, index, array) {
              //blastAlignmentsOutstanding = blastAlignmentsOutstanding + 1;

              // /////console.log("getting sequence for", element);
              // console.log('adding', element.phagename, 'to selectedGenomes')
              selectedGenomes.upsert({phagename: element.phagename}, {
                phagename: element.phagename,
                genomelength: element.genomelength,
                sequence: element.sequence,
                cluster: element.cluster,
                subcluster: element.subcluster
              }, function () {
                //var dataset = Session.get('currentDataset');

                  //console.log(index, '===', clusterGenomes.length - 1, '?')
                  if (index === clusterGenomes.length - 1) {
                    Meteor.call('updateSelectedData', 'cluster checked', dataset, clusterPhageNames, true, function () {
                      //console.log('updateSelectedData', 'cluster checked', dataset, clusterPhageNames, true)
                      Session.set('selectedPhages', clusterPhageNames)
                     $("#preloader").fadeOut(300).hide();
                    });
                    // console.log('update_phages called from cluster CHECKED event handler');
                    // update_phages();
                    // update_hsps(hspData);
                  }
              });
            //
           });
          } // end if checked
          else {
            //Session.set("progressbarVisibility", false);

            clusterGenomes.forEach( function (element, index, array) {

              //console.log('removing', element.phagename);
              hspData = hspData.filter(function(e, i, a) {
                return !((e.queryName === element.phagename) || (e.subjectName === element.phagename));
              });
                selectedGenomes.remove({phagename: element.phagename}, function () {
                  console.log('removed', element.phagename)
                  alignedGenomes.remove({query: element.phagename}, function () {
                    alignedGenomes.remove({subject: element.phagename}, function () {
                      //blastAlignmentsOutstanding = blastAlignmentsOutstanding - 1;
                      //var dataset = Session.get('currentDataset');
                      if (index === clusterGenomes.length - 1) {
                        Meteor.call('updateSelectedData', 'cluster unchecked', dataset, clusterPhageNames, false, function () {

                          //update_hsps(hspData);
                          update_phages();
                        });
                        console.log('update_phages called from cluster UNCHECKED event handler');
                        // update_phages();
                        // update_hsps(hspData);
                        // $("#preloader").fadeOut(300).hide();
                      }

                      //window.requestAnimationFrame(function () {
                      //  console.log("update_hsps 1088");
                        //update_hsps(hspData);
                      //});
                      //update_hsps(hspData);
                    });
                  });
                });

            });

          }
       //   }
       // });
    //});
    });
  },
  "change .phageCheckbox": function (event, template) {
    $("#preloader").show(function () {
      // get a list of all phagenames on the client
      //phagename = event.target.id.split("-")[0];
      phagename = event.target.id;
      //console.log(event);
      //Session.set("selections", selections++);

      // if user just selected a phage, it doesn't yet exist on the client but should
      //Tracker.autorun(function () {
      // Meteor.subscribe("genomesWithSeq", Session.get("currentDataset"), [phagename], {
      //   onReady: function () {
          var dataset = Session.get('currentDataset');
          if (event.target.checked) {
            console.log(phagename, 'was selected');
            Meteor.call('updateSelectedData', 'phage checked', dataset, [phagename], true, function () {
              update_hsps(hspData); // from phageCheckbox checked
            });
            p = Genomes.findOne({phagename: phagename});
            selectedGenomes.upsert({phagename: p.phagename}, {
              phagename: p.phagename,
              genomelength: p.genomelength,
              sequence: p.sequence,
              cluster: p.cluster,
              subcluster: p.subcluster
            }, function () {
              var dataset = Session.get('currentDataset');
              Meteor.call('updateSelectedData', 'phage checked', dataset, [phagename], true);
            });
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
                var dataset = Session.get('currentDataset');
                Meteor.call('updateSelectedData', 'phage unchecked', dataset, [phagename], false);
                  window.requestAnimationFrame(function () {
                    //console.log("update_hsps 1136");
                    update_hsps(hspData); // from phageCheckbox unchecked
                  });
                  //update_hsps(hspData);
                });
              });
            });
            Meteor.call('updateSelectedData', 'phage unchecked', dataset, [phagename], false, function () {
              update_hsps(hspData); // from updateSelectedData
            });
          }
      //   }
      // });
    // }) end Tracker.autorun()
    });
    $("#preloader").fadeOut(300).hide();
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
     d3.selectAll('text.phagename').attr('transform', function () {
       return 'translate(' + 0 + ', -120)';
     });

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
    console.log ('click .mapSettings')
    event.preventDefault();

    $('#mapSettings').modal('open');
  },

  "change #functionLabelsSwitch": function (event, template) {
    console.log(event.target.checked);
    event.preventDefault();
    //console.log(event.target.checked);
    setTimeout(function () {
      Session.set("showFunctionLabels", event.target.checked)
      d3.selectAll(".functionLabel")
        .transition()
        .duration(d3.max([500, phagedata.length * 20]))
        //.delay(3000)
        .attr("opacity", function () {
          if (Session.get("showFunctionLabels") === true) {
            return 1;
          }
          else {
            return 0;
          }
        });
    }, 200);
  },

  "change #phamLabelsSwitch": function (event, template) {
    event.preventDefault();
    console.log(event.target.checked);
    setTimeout(function () {
      Session.set("showPhamLabels", event.target.checked)
      d3.selectAll(".phamLabel")
        .transition()
        //.delay(200)
        .duration(d3.max([500, phagedata.length * 20]))
        .attr("opacity", function () {
          if (Session.get("showPhamLabels") === true) {
            return 1;
          }
          else {
            return 0;
          }
        });
    }, 200);
  },
    "change #phamAbundanceRadioButton": function (event, template) {
        event.preventDefault();
        //console.log(event.target.checked);

        d3.selectAll(".generect")
            .attr("fill", function (d, i) {
                    phamSize = phamsObj[+d.phamName];

                    scaledAbundance = phamSize/maxPham;
                    //abundancecolorsys=colorsys.hsv_to_rgb({h:0.66, s:0.0, v:1-Math.min(1,(5*scaledAbundance))});
                    return ("hsl(0.66,0%," + (1-(scaledAbundance))*100 + "%)");

            })
            .attr("opacity", function (d) {
              return "1";
            });

        setTimeout(function () {
            Session.set("colorByConservedDomains", false);
            Session.set("colorByPhams", false);
            Session.set("colorByPhamAbundance", true);
        }, 200);
    },
    "change #conservedDomainRadioButton": function (event, template) {
        event.preventDefault();
        //console.log(event.target.checked);

        d3.selectAll(".generect")
          .attr("fill", function (d, i) {
            return (d.domainCount === 0) ? "white" : "orange"
          })
          .attr("opacity", function (d) {
            return "1";
          });

        setTimeout(function () {
            //Session.set("showgccolor", event.target.checked)
            Session.set("colorByPhamAbundance", false);
            Session.set("colorByConservedDomains", true);
            Session.set("colorByPhams", false);
        }, 200);
    },
    "change #phamColorRadioButton": function (event, template) {
        event.preventDefault();

        d3.selectAll(".generect")
          .attr("fill", function (d, i) {
              return d.phamColor;
            })
            .attr("opacity", function (d) {
              return "1";
            });

        setTimeout(function () {
            //Session.set("showphamcolor", event.target.checked)
            Session.set("colorByPhamAbundance", false);
            Session.set("colorByConservedDomains", false);
            Session.set("colorByPhams", true);
        }, 200);
    },

  "change #hspGroupsSwitch": function (event, template) {
    event.preventDefault();
    console.log(event.target.checked);
    setTimeout(function () {
      Session.set("showhspGroups", event.target.checked);

      d3.selectAll(".hsp")
        //.style("visibility", function () { return "visible"; })
        .transition()
        //.delay(250)
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

  "click #clearPhageSelection": function (event, template){
       /////console.log("clearSelection clicked");
    //$('.fixed-action-btn').close();
    d3.select("#clearPhageSelection")
          .transition()
          .duration(250)
          //.style("opacity", 0)
          .each("end", function () {
            selectedGenomes.remove({});
            alignedGenomes.remove({});
            hspData = [];
            var dataset = Session.get('currentDataset');
            Meteor.call('updateSelectedData', 'clear selection', dataset, "", true);
          //$('.fixed-action-btn').close();
          //console.log('EVENT', event);
        });
    svgMap.selectAll(".hspGroup").remove();
    //blastAlignmentsOutstanding = 0;
  },
  "click #expand_all": function (event, template) {
    console.log('expand all: ', event, template)
    //$('.fixed-action-btn').close();
    elem = M.Collapsible.getInstance(d3.select('#cluster-list')[0][0])
    instance = M.Collapsible.getInstance(d3.select('#cluster-list')[0][0])
    instance.open()
    Session.set("clustersExpanded", true);
  },
  "click #scroll_top": function (event, template) {
    //$('.fixed-action-btn').close();
    $("html, body").animate({ scrollTop: 0 }, "slow");
  },

  "click #collapse_all": function (event, template) {
    //$('.fixed-action-btn').close();
    elem = M.Collapsible.getInstance(d3.select('#cluster-list')[0][0])
    instance = M.Collapsible.getInstance(d3.select('#cluster-list')[0][0])
    instance.close()
    Session.set("clustersExpanded", false);

    $("html, body").animate({ scrollTop: 0 }, "slow");

  }
});
