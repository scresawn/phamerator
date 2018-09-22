
  Meteor.startup(function() {
    // Here we can be sure the plugin has been initialized
    //if (Meteor.isCordova) { alert("start saving your pennies")}
    Meteor.subscribe('fullname');
    Meteor.subscribe('featureDiscovery', function () {
      if (Meteor.user().featureDiscovery == null) {
        Session.set("geneTranslation", true);
      }
      else if (Meteor.user().featureDiscovery.geneTranslation == null) {
        Session.set("geneTranslation", true);
      }
      else {
        geneTranslation = Meteor.user().featureDiscovery.geneTranslation;
        Session.set("geneTranslation", geneTranslation);
      }
      console.log("geneTranslation:", Session.get('geneTranslation'));
    });

    if (Meteor.isCordova) {
      if (navigator.connection.type !== 'wifi') {
        $('#connectionWarning').openModal();

      }
    }
    else {
      //var MobileDetect = require('mobile-detect'),
      import MobileDetect from 'mobile-detect';
      var md = new MobileDetect(window.navigator.userAgent);
      console.log( md.os() );
      if (md.mobile() != null) {
        $('#mobileWarning').modal();
      }
    }

    document.addEventListener("online", onOnline, false);

    function onOnline() {
      // Handle the online event
      if (Meteor.isCordova) {
        if (navigator.connection.type !== 'wifi') {
          $('#connectionWarning').modal();

        }
      }
    }
  });


Template.nav.helpers({
  displayname: function() {
    if (!Meteor.user()) {
      return null;
    }
    else if (!Meteor.user().name) {
      return Meteor.user().username;
    }
    return Meteor.user().name;
  },
  loggedIn: function () {
    return Meteor.user() != null;
  },
  imageFile: function () {
    user = Images.collection.findOne({_id: Meteor.user()})
    if (user && user.hasOwnProperty('profile') && user.profile.hasOwnProperty('profilePic')) { profile = user.profile;
      profilePic = user.profile.profilePic;
    }
    else profilePic = "";
    return profilePic;
  },
  phameratorVersion: function () {
    return Session.get('phameratorVersionNumber');
  }
});

Template.nav.onRendered (function () {
  //$(".button-collapse").sideNav({
  //  menuWidth: 240, // Default is 240
  //  edge: 'left' // Choose the horizontal origin
  // closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
  //});

  Meteor.subscribe('files.images.all');
  Meteor.subscribe('fullname');
  //this.Images = new FilesCollection({collectionName: 'Images'});
  //Materialize.fadeInImage('#profilepic');

  $(".button-collapse").sideNav();



  // Side Navigation fix
  $('.side-nav li a').on('click', function(e) {
    console.log("sideNav item selected");
    windowsize = $(window).width();
    console.log(windowsize);
    if (windowsize < 992) {
      //$('.button-collapse', this).sideNav('hide');
      window.setTimeout(function(){
        console.log("trying to close sideNav...");
        $('.button-collapse', this).sideNav('hide');
      }, 1000);
    }
  });
});
