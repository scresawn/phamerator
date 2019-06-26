export const adjust_skew = (genome) => {
  console.log (d3.transform(d3.select(genome).attr("transform")).translate[0]);
  if (typeof d3.transform(d3.select(genome).attr("transform")).translate[0] == undefined) {
    d3.select(genome).attr("transform", "translate(0," + d3.transform(d3.select(genome).attr("transform")).translate[1] + ")")
  }
  queryForThisSubjectName = null;
  subjectForThisQueryName = null;
  queryForThisSubjectX = null;
  subjectForThisQueryX = null;
  subjectForThisQuerySelection = null;
  queryForThisSubjectSelection = null;
  hspQueryPaths = null;
  hspSubjectPaths = null;
  //d.xpos = d3.transform(d3.select(this).attr("transform")).translate[0];

  hspGroupHeight = 270;
  // get the hspGroup whose subject is this genome
  hspGroupSubject = d3.selectAll(".hspGroup").filter(function (d) {
    // get only those .hspGroup that have the dragged subject
    return (genome.id.indexOf("phage_" + d.subjectName.replace(/\./g, '_dot_')) == 0)
  });
  if (hspGroupSubject.size() > 0) {
    hspSubjectPaths = hspGroupSubject.selectAll("path");

    // get the query of that subject (genome above this one)
    queryForThisSubjectName = hspGroupSubject[0][0].id.split("___")[0];
    queryForThisSubjectSelection = d3.select("g#" + queryForThisSubjectName);
    // get the offset of the genome above
    queryForThisSubjectX = d3.transform(queryForThisSubjectSelection.attr("transform")).translate[0];

    //console.log("queryForThisSubjectX:", queryForThisSubjectX);
  }

  // get the hspGroup whose query is this genome
  hspGroupQuery = d3.selectAll(".hspGroup").filter(function (d) {
    // get only those .hspGroup that have the dragged query
    return (genome.id.indexOf("phage_" + d.queryName.replace(/\./g, '_dot_')) == 0)
  });
  if (hspGroupQuery.size() > 0) {
    hspQueryPaths = hspGroupQuery.selectAll("path");

    // get the subject of that query (genome below this one)
    subjectForThisQueryName = hspGroupQuery[0][0].id.split("___")[1];
    subjectForThisQuerySelection = d3.select("g#" + subjectForThisQueryName);
    subjectForThisQueryX = d3.transform(subjectForThisQuerySelection.attr("transform")).translate[0];
  }
  if ( d3.event && d3.event.x != undefined) {
    if ((d3.event.x < svgMap.attr("x")) && d3.event.x < 0) {
      // dragging this genome off the left end, keep this genome still and drag everything else to the right instead
      d3.select("#mapGroup")
        .attr("transform", function( d, i ) {
          // move the genome along the x axis
          return "translate(" + -d3.event.x + "," + 0 + ")";
      });
    }

    d3.select(genome)
      .attr("transform", function(d) {
        // move the genome along the x axis
        return "translate(" + d3.event.x + "," + d3.transform(d3.select(genome).attr("transform")).translate[1] + ")";
    });
  }
  //console.log("typeof subjectForThisQueryName", typeof subjectForThisQueryName)
  //console.log("typeof queryForThisSubjectName", typeof queryForThisSubjectName)

  // if there is an hspGroup below this genome...
  var x = d3.transform(d3.select(genome).attr("transform")).translate[0];
  if (d3.event && d3.event.x != undefined) {
    var x = d3.event.x;

  }
  if ( subjectForThisQueryName != null) {
    hspQueryPaths.attr("transform", function (d) {
      var angle = Math.atan2(subjectForThisQueryX - x,hspGroupHeight) * (180/Math.PI);
      //console.log("belowX:", subjectForThisQueryX, "d3.event.x:", d3.event.x);
      return "skewX(" + angle +")"+ "translate(" + (x) + "," + 0 + ")";
    });
  }

  // if there is an hspGroup above this genome...
  if (queryForThisSubjectName != null) {
    hspSubjectPaths.attr("transform", function (d) {
      var angle = -Math.atan2(queryForThisSubjectX - x,hspGroupHeight) * (180/Math.PI);
      return "skewX(" + angle +")"+ "translate(" + queryForThisSubjectX + "," + 0 + ")";
    })
  }
}
