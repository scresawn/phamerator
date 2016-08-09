selectedGenomes2 = new Meteor.Collection(null);


Template.repeats.onCreated(function() {
    //Meteor.subscribe('genomes');
    console.log("phages template created");

});

//in rendered callback
var key = function(d) {
    return d.phagename;
};


drawRepeats = function (svg) {
    console.log("tracker autorun has rerun");
    //d3.selectAll("#mappy").remove();

    svg.attr("height", function(d) {return (selectedGenomes2.find().count() * 750) });
    svg.attr("width", function (d) {
        return 1000
    });


    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    //d3.select('.determinate').style("width", "0%");

    function x() {
        console.log(d3.select(this).data());
    };

    //bind the data
    var phage1 = svg.selectAll(".phages")
        .data(function() {
            pnames = selectedGenomes2.find({},{phagename:1}).fetch().map(function(obj){ return obj.phagename;});
            phages = Genomes.find({phagename: {$in: pnames}}, {sort: {cluster:1, phagename:1}});
            //todo: get selected primary and secondary sort fields and ascending/descending
            return phages.fetch();
        }, key);

    //move the images over
    phage1
        .attr("transform", function (d, i) {
            return "translate(400," + ((i * 750)+400) + ")";
        });

    //enter new images and move appropriately
    var newPhage = phage1.enter().append("g")
        .classed("phages", true)
        .attr("transform", function (d, i) {
            return "translate(400," + ((i * 750)+400) + ")";
        });

    //remnant of old design
    /*var keystone = d3.svg.arc()
        .innerRadius(230)
        .outerRadius(250)
        .startAngle(-0.0436332)
        .endAngle(0.0436332);*/

    //add in phage name
    newPhage.append("text")
        .attr("x", -400)
        .attr("y", -300)
        .attr("font-family", "sans-serif")
        .attr("font-size", "24px")
        .attr("fill", "black")
        .style("text-anchor", "left")
        .text(function (d) {
            return d.phagename;
        })
        .attr({"fill-opacity": 1});

    //set parameters for gene arcs
    var arcg = d3.svg.arc()
            .innerRadius(function(d){if (d.name%2==0)
                return 290;
            else if (d.name%2==1)
                return 250;})
            .outerRadius(function(d){if (d.name%2==0)
                return 330;
            else if (d.name%2==1)
                return 290;})
            .startAngle(function(d){
                return ((d.start/this.parentNode.__data__.genomelength)*6.2)+0.0436332;})
            .endAngle(function(d){
                return ((d.stop/this.parentNode.__data__.genomelength)*6.2)+0.0436332;})
        ;

    //bind gene data and draw gene arcs
    newPhage.selectAll(".paths")
        .data(function(d){return d.genes;})
        .enter()
        .append("svg:path")
        .attr("fill", function(d){
            return d.phamColor;
        })
        .style("stroke", "black")
        .attr("d", arcg)
        .attr("class", "garcs")
        .style("opacity", 1)
        .on("mouseover.arc", function() {
            d3.select(this).style("stroke", "#ffb973").style("stroke-width", 2)
        })
        .on("mouseover.tip", function(d) {
            nodedata = this.parentNode.__data__;
            div.transition()
                .duration(500)
                .style("opacity", .9);
            div	.html(nodedata.phagename + " gp" + d.name)

            // the text of the tooltip ...
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout.arc", function() {
            d3.select(this).style("stroke", "black").style("stroke-width", 1);
        })
        .on("mouseout.tip", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        })
        ;

    //color gene arcs by Pham Color
    document.getElementById("Phamily").onclick = function(d) {
        d3.selectAll(".garcs")
        //.transition().duration(1000)
            .attr("fill", function (d) {
                return d.phamColor;
            })
        ;
    };

    //color gene arcs by direction
    document.getElementById("Direction").onclick = function(d) {
        d3.selectAll(".garcs")
        //.transition().duration(1000)
            .attr("fill", function (d) {
                if (d.direction === "forward") {
                    return "green"
                }
                else if (d.direction === "reverse") {
                    return "red"
                }
                else {return "black"}
            })
        ;
    };

    //set parameters for the ruler arc
    var arcr = d3.svg.arc()
        .innerRadius(230)
        .outerRadius(250)
        .startAngle(0.0436332)
        .endAngle(2*Math.PI-0.0436332);

    //draw the ruler arc
    newPhage.append("path")
        .attr("d", arcr)
        .style({ fill: "white", opacity: 1})
        .attr({stroke: "black"})
        .attr({"stroke-width": 2});

    //remnant of old style
   /* Keystone
    newPhage.append("path")
        .attr("d", keystone)
        .attr("fill", "white"); */


//Add code for line ticks/*
    var r = d3.scale.linear()
        .domain([0, 1])
        .range([0, 200]);


//default accessor [[x1,y1]] => radian and angle
    var line = d3.svg.line.radial()
        .radius(function(d){ return (r(d[1])); })  // will change between -1 and 1
        .angle(function(d) { return d[0];});


// radius axis
// cheat with CSS
   /* var gr = newPhage.append("g")
        .attr("class", "r axis")
        .selectAll("g")
        .data(r.ticks(10).slice(0))
        .enter().append("g");
*/

   //set parameters for thousand bp tick marks
    var thoutick = newPhage.append("g")
        .attr("stroke", "black")
        .selectAll("g")
        .data(function(d){return d3.range(2.5, 357.5, (1000/d.genomelength)*355);})//replace 80000 with genome length
        .enter().append("g")
        .attr("transform", function(d) {
            return "rotate(" + (d-90) + ")"; });

    //set parameters for 500 bp tick marks
    var fhuntick = newPhage.append("g")
        .attr("stroke", "black")
        .selectAll("g")
        .data(function(d){return d3.range(2.5, 357.5, (500/d.genomelength)*355);})//replace 80000 with genome length
        .enter().append("g")
        .attr("transform", function(d) {
            return "rotate(" + (d-90) + ")"; });

    //set parameters for 5000 bp tick marks
    var fthotick = newPhage.append("g")
        .attr("stroke", "black")
        .selectAll("g")
        .data(function(d){return d3.range(2.5, 357.5, (5000/d.genomelength)*355);})//replace 80000 with genome length
        .enter().append("g")
        .attr("transform", function(d) {
            return "rotate(" + (d-90) + ")"; });

    //draw 5000 bp tick marks
    fthotick.append("line")
        .attr("x2", 250);

    //draw 500 bp tick marks
    fhuntick.append("line")
        .attr("x2", 235)
        .style({opacity: 1});

    //draw 1000 bp tick marks
    thoutick.append("line")
        .attr("x2", 240)
        .style({opacity: 1});

    //draw circle to cover radial line and to draw repeats on
    newPhage.append("circle")
        .attr({cx: 0, cy: 0, r: 229.1})
        .attr({stroke: "none"})
        .style({ fill: "white", opacity: 1});

    //rounds a number to nearest increment of 5
var roundToFive = function (x) {return (x%5) >= 2.5 ? parseInt(x / 5) * 5 + 5 : parseInt(x / 5) * 5;};

    //add text to 5000 bp tick marks
    fthotick.append("text")
        .attr("x", 240)
        .attr("dy", ".85em")
        .style("text-anchor", "middle")
        .text(function(d) { return roundToFive(((d-2.5)/355)*(this.parentNode.parentNode.__data__.genomelength/1000)); })//Replace 80000 with genome length
        .style("fill", "green")
        .attr({stroke: "none"})
        .attr({"font-size": "14px", "font-family": "Arial"})
    ;

    //gets rid of phage from selection
    phage1.exit().remove();

};

Template.repeats.onRendered(function () {
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
    svg = d3.select("#repeat")
        .append("svg");

    Tracker.autorun(function () {
        setTimeout(drawRepeats(svg));
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
                    return {"name": "Singletons", "cluster": "", "subcluster": "", phageNames: phageNames}
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

Template.repeats.helpers({
    clusters: function () { return getclusters(); },
    selectedGenomes2: selectedGenomes2
});

Template.repeats.events({

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
                clusterGenomes = Genomes.find({cluster: "", subcluster: ""}).fetch();
            }
            clusterGenomes.forEach( function (element, index, array) {
                if (event.target.checked) {
                    console.log("I should be selecting", element);
                    selectedGenomes2.upsert({phagename: element.phagename}, {
                        phagename: element.phagename,
                        genomelength: element.genomelength,
                        cluster: element.cluster,
                        subcluster: element.subcluster
                    });
                }
                else {
                    selectedGenomes2.remove({phagename: element.phagename});
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
                selectedGenomes2.upsert({phagename:p.phagename}, {
                    phagename:p.phagename,
                    genomelength:p.genomelength});

            }
            // if user just unselected a phage, it exists on the client but shouldn't
            else {
                console.log(phagename, 'was unselected');
                //Genomes.update({"phagename":phagename},{selected: false});
                selectedGenomes2.remove({"phagename":phagename});
            }
        });
    },
    "click .downloadRepeatMap": function (event, template) {
        console.log("downloadRepeatMap clicked");
        svg = d3.select("#repeat").select("svg");
        var a = d3.select("#repeat").append("a").node();
        a.download = 'repeat_map.svg'; // file name
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
        if (selectedGenomes2.find({"phagename": phage.phagename}).count() == 0) {
            r = false;
        }
    });
    return r;
});

Template.registerHelper('phageIsChecked',function(input){
    return selectedGenomes2.find({"phagename": input}).count() > 0;
});/**
 * Created by grybnicky on 8/1/16.
 */

