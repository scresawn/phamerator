
Template.phages.onCreated(function() {
  console.log('Template.phages.onCreated');

  Session.set("clusters", []);
  Session.set("clustersExpanded", false);
  Session.set("showFunctionLabels", true);
  Session.set("showPhamLabels", true);
  Session.set("showhspGroups", true);
  Session.set("colorByPhamAbundance", false);
  Session.set("colorByConservedDomains", false)
  Session.set("colorByPhams", true)

  // Tracker.autorun(() => {
    console.log('Template.phages.onCreated autorun 1')
    Meteor.call('getlargestphamsize', function(error, result) {
      if (typeof error !== 'undefined') {
        console.log('error getting phams:', error);
      }
      else {
        maxPham = result;
        console.log('maxpham', result)
      }
    });

    console.log('getclusters(', dataset, ')')
    Meteor.call('getclusters', dataset, function(error, result) {

      if (typeof error !== 'undefined') {
        console.log('error getting clusters:', error);
      }
      else {
        console.log('getclusters() done')
        //debugger;
        Session.set('clusters', result);
      }
    });
  // })

  // Tracker.autorun(() => {
    console.log('Template.phages.onCreated autorun 2')
    selectedData = Meteor.subscribe('selectedData');
    if (selectedData.ready()) {
      console.log('new selectedData ready!!!!');
      console.log(Meteor.user());
      console.log('getting largest pham size...')

      console.log('calling getphams()')
      // Meteor.call('getphams', dataset, function(error, result) {
      //
      //   if (typeof error !== 'undefined') {
      //     alert('error getting phams:', error)
      //     console.log('error getting phams:', error);
      //   }
      //   else {
          console.log('got phams from getphams()', result.length)
          Session.set('phamsObj', result);
          phamsObj = result;
          console.log('done with getphams() handler')
          //selectedGenomes.remove({});
          // console.log('resubscribing to genomesWithSeq')
          // var genomesWithSeqHandle = Meteor.subscribe("genomesWithSeq", Session.get('currentDataset'), Session.get('selectedPhages'));
          // //   // fetch data after subscription is ready
          // if (genomesWithSeqHandle.ready()) {
          //   //Session.set('selectedPhages', Genomes.find({sequence: {$exists: true}}).fetch())
          //   Meteor.call('getphams', dataset, function(error, result) {
          //     console.log('calling getphams()')
          //     Session.set('phamsObj', result);
          //     phamsObj = result;
          //   })
          //
          //   // console.log('update_phages()')
          //   // update_phages();
          //   // update_hsps(hspData);
          //   // $("#preloader").fadeOut(300).hide();
          // }
      //   }
      // })
    }
    else {
      console.log('selectedData subscription not ready yet')
    }
   // })

Tracker.autorun(() => {
  console.log('renewing genomesWithSeqHandle');
  var genomesWithSeqHandle = Meteor.subscribe("genomesWithSeq", dataset, Meteor.user().selectedData[dataset]['genomeMaps']);
  if (genomesWithSeqHandle.ready()) {
    Meteor.call('getphams', dataset, function(error, result) {
      console.log('calling getphams()')
      Session.set('phamsObj', result);
      phamsObj = result;
      $("#preloader").fadeOut(300).hide();
    });
    names = Meteor.user().selectedData[dataset].genomeMaps;
    if (names && names.length > 0) {
      //Materialize.toast("Restoring your work...", 99999999999999, '', function () {
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
  }
})

    // Session.get('currentDataset') is reactive, so this should run whenever
    // its value changes

  /*if (Meteor.user() && Meteor.user().preferredDataset) {
    Session.set("currentDataset", Meteor.user().preferredDataset);
  }*/


});
