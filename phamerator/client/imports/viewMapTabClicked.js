import { update_phages } from './updatePhages.js'
import { update_hsps } from './updateHsps.js';

export const viewMapTabClicked = () => {
  d3.selectAll('.hspGroup').attr('opacity', 0)
  // setTimeout(() => {
  //   M.toast({
  //     html: 'Aligning genomes and drawing your map...',
  //     completeCallback: () => {
  //       M.toast({html: 'Done!'})
  //     }}
  //   )}
  // , 0);

  Meteor.subscribe('featureDiscovery', function () {
    var featureKey = Meteor.user().featureDiscovery[0];
    //console.log("meteor user:", Meteor.user());
    //console.log("features:", features);
    //console.log("featureKey:", features[featureKey]);
    if (features[featureKey] != null) {
      //console.log("title:", features[featureKey].title);
      Session.set("newFeatureTitle", features[featureKey].title);
      Session.set("newFeatureBody", features[featureKey].body);
      Session.set("newFeatureDismiss", features.dismiss);
    }
    update_phages();
    setTimeout(update_hsps, 15000, hspData); // from viewMapTabClicked
    $("#preloader").fadeOut(300).hide();
  });

  if (Session.get("newFeature") === true) {
    console.log("opening  featureDiscovery!");
    $('.tap-target').tapTarget('open');
  }
}
