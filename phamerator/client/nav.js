
  Meteor.startup(function() {
    // Here we can be sure the plugin has been initialized
    //if (Meteor.isCordova) { alert("start saving your pennies")}
    Meteor.subscribe('fullname');

    if (Meteor.isCordova) {
      if (navigator.connection.type !== 'wifi') {
        $('#connectionWarning').openModal();

      }
    }

    document.addEventListener("online", onOnline, false);

    function onOnline() {
      // Handle the online event
      if (Meteor.isCordova) {
        if (navigator.connection.type !== 'wifi') {
          $('#connectionWarning').openModal();

        }
      }
    }
  });


Template.nav.helpers({
  displayname: function() {
    return Meteor.user() ? Meteor.user().name : null;
  },
  loggedIn: function () {
    return Meteor.user() != null;
  },
  imageFile: function () {
    profilePic = Images.collection.findOne({_id: Meteor.user().profile.profilePic});
    if ( typeof profilePic !== 'undefined') {
      //console.log(profilePic);
      return profilePic;
    }
    else {
      console.log("no profilePic found");
      return "";
    }
  }
});

Template.nav.rendered = function () {
  //$(".button-collapse").sideNav({
  //  menuWidth: 240, // Default is 240
  //  edge: 'left' // Choose the horizontal origin
  // closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
  //});

  Meteor.subscribe('files.images.all');
  Meteor.subscribe('fullname');
  //this.Images = new FilesCollection({collectionName: 'Images'});
  Materialize.fadeInImage('#profilepic');

  $(".button-collapse").sideNav();



  // Side Navigation fix
  $('.side-nav li a').on('click', function(e) {
    windowsize = $(window).width();
    if (windowsize < 992) {
      //$('.button-collapse', this).sideNav('hide');
      window.setTimeout(function(){
        $('.button-collapse', this).sideNav('hide');
      }, 1000);
    }
  });
};