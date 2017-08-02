//Session.set('geneTranslation', )

updateFeatureDiscoveryStore = function (featureName) {
  // this needs to do Meteor.call()...
  Meteor.call('updateFeatureDiscovery', featureName);
  console.log('updating feature discovery');

  //Meteor.user().selectedData['featureDiscovery'] = {featureName: true};
  Session.set("geneTranslation", false);
};

Template.featureDiscovery.onCreated(function () {
  Meteor.subscribe('featureDiscovery', function () {
    gt = Meteor.user().featureDiscovery.indexOf('geneTranslation');
    if (gt != -1) {
      gt = true;
    }
    else { gt = false }
    Session.set('geneTranslation', gt);
    console.log('subscribed to featureDiscovery');
  })
});

Template.featureDiscovery.onRendered (function () {
  console.log('featureDiscovery template rendered');
  //$('.tap-target').tapTarget('open');

    //$('div').find('.geneTranslationDismiss').unbind('click');
    $('div').find('.geneTranslationDismiss').on('click', function (e) {
      console.log("e:", e);
      updateFeatureDiscoveryStore('geneTranslation');
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
});

Template.featureDiscovery.events({

});