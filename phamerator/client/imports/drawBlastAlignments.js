import { update_hsps } from './updateHsps';
import { blastAlignmentsOutstanding } from './updatePhages';

//export const drawBlastAlignments = (blastAlignmentsOutstanding, json) => {
export const drawBlastAlignments = (json) => {
  blastAlignmentsOutstanding = blastAlignmentsOutstanding - 1;
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
      hspCoordinates.push({x: value.query_from/10, y: 0, evalue: value.evalue, identity: value.identity, align_len: value.align_len});
      hspCoordinates.push({x: value.query_to/10, y: 0});
      hspCoordinates.push({x: value.hit_to/10, y: 270});
      hspCoordinates.push({x: value.hit_from/10, y: 270});
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
    //console.log("no valid json found");
  }

  // console.log("drawBLASTalignments for ", queryName, subjectName);
  // console.log('blastAlignmentsOutstanding', blastAlignmentsOutstanding)

  parseBlastResult(queryName, subjectName, blasthsps);

  if (blastAlignmentsOutstanding <= 0) {
    // window.requestAnimationFrame(function () {
    //   //console.log("drawBLASTalignments");
    //   $(".restoring-your-work-toast").fadeOut();
    //
    //   console.log('update_hsps 60')
    //   setTimeout(Session.set("progressbarVisibility", false), 0);
    //   console.log('update_hsps() called from drawBlastAlignments()');
    //   setTimeout(update_hsps(hspData), 0); // from drawBlastAlignments (but why?)
    //   //setTimeout(Materialize.toast("Ready!", 2000), 5000);
    // });
  }
  else {
    i = 0;
    animate();
    function animate() {
      i == 0 && requestAnimationFrame(animate);
      d3.select('.determinate').style('width', ((phagesdata.length - blastAlignmentsOutstanding) / phagesdata.length) * 100 + "%");

      //Session.set("progressbarVisibility", true);
      //Session.set("progressbarState", ((phagesdata.length - blastAlignmentsOutstanding) / phagesdata.length) * 100 + "%");
      i++;
    }
  }
};
