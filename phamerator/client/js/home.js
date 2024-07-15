Template.home.onCreated(function () {
});

Template.home.onRendered(function () {
  var updatedTerms = false;
  Meteor.subscribe('newTermsAndPolicies', function () {
    if (Meteor.user()) {
      updatedTerms = Meteor.user().newTermsAndPolicies;
      Session.set('updatedTerms', updatedTerms);
    }

    dismissToast = function () {
      Meteor.call("updateNewTermsAndPolicies");
      $('.toast').fadeOut();

      setTimeout(function () {
        Materialize.toast("Links to the terms of use and privacy policy can be found at the bottom of every page", 5000);
      }, 1000);
    };

    if (updatedTerms === true && $('.toast').length === 0) {
      setTimeout(function () {
        var newPrivacyPolicyToast = $("<span>We have updated our <a href='terms'>terms and privacy policy</a>. By continuing to use the software, you accept the terms and policies. <a href='' style='color: orange'><span onclick='dismissToast(); return false'>Dismiss</span></a>");
        Materialize.toast(newPrivacyPolicyToast, 6.048e+8); // Hide after a week...
      }, 1000);

    }
  })

  $(document).ready(function () {
    $('.parallax').parallax()
  });
  $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.home.helpers({
  updatedTerms: function () {
    return Session.get('updatedTerms');
  }
});