import { viewMapTabClicked } from '../../imports/viewMapTabClicked.js';

Template.phages.onRendered(function () {
  console.log('Template.phages.onRendered');
  //debugger;

  this.autorun(() => {
    // if (!Meteor.loggingIn()) {
    console.log('this.autorun()')
////////////////////////////
if(Meteor.user() && Meteor.user().selectedData) {
  //console.log('ROUTES: getting dataset')
  dataset = Session.get('currentDataset');
  //while (dataset == undefined) { setTimeout(100, function () {}) }
  //console.log('ROUTES: dataset is', dataset);

  // wrap Meteor.subscribe calls in this.wait()
  // and then use this.ready()?
  //console.log('ROUTES: subscribing to genomes')
  //console.log('ROUTES: subscribing to selectedData')
  //console.log('selectedData', Meteor.user().selectedData)
  //console.log('ROUTES: getting names', Meteor.user())
  if (dataset && Meteor.user() && Meteor.user().selectedData && Meteor.user().selectedData[dataset] && Meteor.user().selectedData[dataset].genomeMaps) {
    ///names = Meteor.user().selectedData[dataset].genomeMaps;
    //console.log('ROUTES: subscribing to genomesWithSeq')
    ///this.subscribe("genomesWithSeq", dataset, names).wait();
    //console.log('ROUTES: subscribing to allUsers')
    Meteor.subscribe('allUsers');
  }
}
///////////////////////////////



      //Meteor.subscribe("genomesWithSeq", dataset, Meteor.user().selectedData[dataset].genomeMaps);
    // }
    // else {
    //   console.log('waiting for login')
    // }

    console.log('done subscribing to stuff')
  });

  Tracker.autorun(function () {
    dataset = Session.get('currentDataset');
    console.log('recomputing clusters because dataset changed!')

    //console.log('AUTORUN: clearing selectedGenomes')
    //selectedGenomes.remove({});
    //console.log('AUTORUN: clearing alignedGenomes')
    //alignedGenomes.remove({});

    //console.log(Meteor.user())
    //names = Meteor.user().selectedData[dataset].genomeMaps;
    // if (names && names.length > 0) {
    //   //Materialize.toast("Restoring your work...", 99999999999999, '', function () {
    //   names.forEach(function (value, index, myArray) {
    //     //console.log("value:", value);
    //     xx = Genomes.find({phagename: value}, {
    //       fields: {
    //         phagename: 1,
    //         genomelength: 1,
    //         sequence: 1,
    //         cluster: 1,
    //         subcluster: 1
    //       }
    //     }).fetch();
    //     //console.log("xx:", xx);
    //     xx.forEach(function (p, i, a) {
    //       console.log("restoring saved", p);
    //       selectedGenomes.upsert({phagename: p.phagename}, {
    //         phagename: p.phagename,
    //         genomelength: p.genomelength,
    //         sequence: p.sequence,
    //         cluster: p.cluster,
    //         subcluster: p.subcluster
    //       });
    //     });
    //   });
    // }
  })


  $("#preloader").fadeOut(300).hide();
  $(document).ready(function() {
    $('ul.tabs').tabs();
    // where to put this so that the button initializes correctly?
    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init(elems, {direction: 'left', hoverEnabled: true});

    $('#mapSettings').modal();
    $('#geneData').modal();
    $('.collapsible').collapsible({
      accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
    $(document).on("keydown", function (event) {
      if (event.which === 16) {
        d3.selectAll(".phagename").classed("horizontalAlign", true);
      }
    });
    $(document).on("keyup", function (event) {
      if (event.which === 16) {
        d3.selectAll(".phagename").classed("horizontalAlign", false);
      }
    });
  });
//Renamed svg to svgMap to distinguish genome map svg canvas from other canvases

  svgMap = d3.select("#svg-genome-map");
  svgMap.attr("border", "50px")
      .attr("overflow", "visible");

  documentFragment = document.createDocumentFragment();

  //mapGroup = svgMap.append("g").attr("id", "mapGroup");
  //mapGroup = d3.select(documentFragment).append("g").attr("id", "mapGroup");
  mapGroup = d3.select(documentFragment).append("svg:g");
  mapGroup.attr("id", "mapGroup");

 // Access Domain Visual SVG canvas and add to it
  svgDomain = d3.select("#svgDomain");
  svgDomain.attr("display", "block")
      .attr("margin", "auto")
      .attr("viewBox", "0 0 650 100")
      .attr("preserveAspectRatio", "xMinYMin meet")
      //.attr("height", "66%")
      //.attr("width", "100%")
      ;

  document.getElementById("viewMapTab").addEventListener ("click", viewMapTabClicked, {passive: true});
  console.log('calling update_phages() from onRendered()')

});
