Template.home.onCreated(function() {
  //Meteor.subscribe('genomes');
  console.log("home template created");

});

Template.home.onRendered(function () {
  Meteor.subscribe('featureDiscovery', function () {

    updatedTerms = Meteor.user().featureDiscovery.indexOf('updatedTerms');
    if (updatedTerms != -1) {
      updatedTerms = true;
    }
    else { updatedTerms = false }
    Session.set('updatedTerms', updatedTerms);
    console.log('subscribed to featureDiscovery');
    dismissToast = function () {
      updateFeatureDiscoveryStore('updatedTerms');
      $('.toast').fadeOut();

      setTimeout(function () {
        Materialize.toast("Links to the terms of use and privacy policy can be found at the bottom of every page", 5000);
        //var toastElement = $('.toast').first()[0].remove();
      }, 1000);

    };
    console.log('updatedTerms:', updatedTerms);
    if (updatedTerms === true && $('.toast').length === 0) {
      setTimeout(function () {
        var newPrivacyPolicyToast = $("<span>We have updated our <a href='terms'>terms and privacy policy</a>. Please take a look. <a href='' style='color: orange'><span onclick='dismissToast(); return false'>Dismiss</span></a>");
        Materialize.toast(newPrivacyPolicyToast, 6.048e+8); // Hide after a week...
      }, 1000);

    }
  })

   $(document).ready(function(){
     //h = $(document).height() - $('nav').height();
     //console.log(h);
     //$('.carousel.carousel-slider').carousel({fullWidth: true});
     //$('.carousel.carousel-slider').height(h);
     $('.parallax').parallax()


     //setTimeout(function() {$('.parallax').parallax()}, 5000);
   });
  });

  Template.home.helpers({
    updatedTerms: function () {
      return Session.get('updatedTerms');
    }
  });

/*Template.home.onRendered(function () {
   $(document).ready(function(){
    $('.collapsible').collapsible({
      accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
  });
});*/
