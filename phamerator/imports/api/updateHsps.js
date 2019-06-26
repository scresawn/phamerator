import { adjust_skew_all } from './adjust_skew_all.js';

var colorsys = require('colorsys');

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
  .style("font-family", "Arial")
  .style("border-radius","8px");

export const update_hsps = (hspData) => {
  //console.log("update_hsps:", hspData);
  hspGroup = mapGroup.selectAll(".hspGroup")
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

  hspGroup.enter().insert("svg:g", ":first-child")
    .classed("hspGroup", true)
    .attr("id", function (d) {
      console.log("appending phage group");

      // i = 0;
      // animate();
      // function animate() {
      //   i == 0 && requestAnimationFrame(animate);
      //   //Session.set("progressbarState", ((phagesdata.length - blastAlignmentsOutstanding) / phagesdata.length) * 100 + "%");
      //   //console.log("blastAlignmentsOutstanding: ", blastAlignmentsOutstanding);
      //   //console.log(i);
      //   i++;
      // }

      return "phage_" + d.queryName.replace(/\./g, '_dot_') + "___phage_" + d.subjectName.replace(/\./g, '_dot_');
    })
    .each(function (d) {
      var hsps = svgMap.selectAll("g#phage_" + d.queryName.replace(/\./g, '_dot_') + "___phage_" + d.subjectName.replace(/\./g, '_dot_') + ".hspGroup")
        .selectAll(".hsp")
        .data(function(d) {
          return d.genome_pair_hsps;
        });
      hspsEnter = hsps.enter();
      hspsEnter
        .insert("svg:path", ":first-child")
        .classed("hsp", true)
        .on("mouseover", function(d) {
          d3.select(this).style({"stroke": "black", "stroke-width": "2"});
          //d3.select(this).style("stroke-width", 3);
          tooltip.html("e-value: " + d[0].evalue.toExponential(3) + "<br>" + d[0].identity + "/" + d[0].align_len + " (" + d3.format("0.000%")(d[0].identity/d[0].align_len) + ")");
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
        /*attr("transform", function (d) {
          return "translate(" + d[0].x + "," + d[0].y + ")";
        })*/
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
        //.delay(3000)
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
          d3.select(this).style("stroke-width", 0);
          tooltip
            .style("opacity", 0);
          return tooltip.style("visibility", "hidden");
        });
    });

  hspGroup
    .attr("transform", function (d) {
      if (d3.select('g#phage_'+d.queryName.replace(/\./g, '_dot_'))[0][0] !== null) {
        var t = d3.transform(d3.select('g#phage_' + d.queryName.replace(/\./g, '_dot_')).attr("transform")),
          x = 0;//t.translate[0],
          y = t.translate[1] + 30;// - 150;
          //console.log(t);
        return "translate(" + x + "," + y + ")";
      }
    });

  if (Session.get("showhspGroups") === true) {
    d3.selectAll(".hspGroup").transition().duration(1000).style("opacity", 1);
  }
  console.log('adjust_skew_all 167')
  adjust_skew_all();

}
