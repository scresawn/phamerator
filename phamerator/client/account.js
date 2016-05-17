/**
 * Created by steve on 3/30/16.
 */
Template.account.onRendered(function () {
  
});

Template.account.helpers({
  email: function() {return Meteor.user() ? Meteor.user().emails[0].address : null;}
});