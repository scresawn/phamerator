updateFeatureDiscoveryStore = function () {
  Session.set('newFeatureTitle', null);
  Session.set('newFeatureBody', null);
  Session.set('newFeatureDismiss', null);
  Meteor.call('updateFeatureDiscovery');

};

features = {
  "geneTranslation": { "title": "Gene Translations", "body": "To view the amino acid sequence of a protein, select the gene on the map, then select PROTEIN." },
  "phamAbundance": { "title": "Color By Pham Abundance", "body": "In settings, switch color coding to Phamily Abundance. The darker the pham, the more members!" },
  "phamMembersByCluster": { "title": "Pham Members By Cluster", "body": "To see which other phages/clusters encode a member of this pham, select a gene on the map, then select CLUSTERS" },
  "geneNotes": { "title": "Gene Functions", "body": "Some genes have annotated functions. To see them, select a gene from the map, then select the FUNCTION tab." },
  "tRNAs": { "title": "tRNAs", "body": "tRNA genes are now displayed on genome maps" },
  "dismiss": "(Press the thumbs up and we won't show you this message again.)"
};

Template.featureDiscovery.onCreated(function () {
});

Template.featureDiscovery.onRendered(function () {

  $('div').find('.featureDiscoveryDismiss').on('click', function (e) {
    updateFeatureDiscoveryStore();
  });
});

Template.featureDiscovery.helpers({

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
