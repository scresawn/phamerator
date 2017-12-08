updateFeatureDiscoveryStore = function () {
  // this needs to do Meteor.call()...
  Session.set('newFeatureTitle', null);
  Session.set('newFeatureBody', null);
  Session.set('newFeatureDismiss', null);
  Meteor.call('updateFeatureDiscovery');
  console.log('updating feature discovery');

  //Meteor.user().selectedData['featureDiscovery'] = {featureName: true};
  //Session.set(featureName, false);
};

features = {
   "geneTranslation": {"title": "Gene Translations", "body": "Amino acid sequences are now available. Select a gene on the map, then select PROTEIN."},
   "phamAbundance": {"title": "Color By Pham Abundance", "body": "In settings, switch color coding to Phamily Abundance. The darker the pham, the more members!"},
   "phamMembersByCluster": {"title": "Pham Members By Cluster", "body": "To see which other phages/clusters encode a member of this pham, select a gene on the map, then select CLUSTERS"},
   "dismiss": "(Press the thumbs up and we won't show you this message again.)"
};

Template.featureDiscovery.onCreated(function () {
  console.log('Template.featureDiscovery.onCreated');

});

Template.featureDiscovery.onRendered (function () {
  console.log('Template.featureDiscovery.onRendered');
  //$('.tap-target').tapTarget('open');

    //$('div').find('.geneTranslationDismiss').unbind('click');
    $('div').find('.featureDiscoveryDismiss').on('click', function (e) {
      console.log("e:", e);
      updateFeatureDiscoveryStore();
        //e.preventDefault();
        //e.stopPropagation();
        //console.log("suppressing close");
        //console.log(e.target);
    });
});

Template.featureDiscovery.helpers({
  /*geneTranslation: function () {
    if (Meteor.user() && Meteor.user().selectedData && Meteor.user().selectedData['featureDiscovery'] && Meteor.user().selectedData['featureDiscovery']['geneTranslation']) {
      return Meteor.user().selectedData['featureDiscovery']['geneTranslation'];
    }
    else { return false; }
  }*/
  featureText: function () {
    //get the first feature in the user's featureDiscovery collection and return it.
      return Session.get("newFeatureTitle");
    },
  featureBody: function () {
    //get the first feature in the user's featureDiscovery collection and return it.
      return Session.get("newFeatureBody");
    },
  featureDismiss: function () {
    //get the first feature in the user's featureDiscovery collection and return it.
      return Session.get("newFeatureDismiss");
    }
});

Template.featureDiscovery.events({

});
