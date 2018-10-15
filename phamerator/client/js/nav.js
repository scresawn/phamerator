switch_dataset = function (dataset) {
  console.log("switch_dataset()", dataset);
  selectedGenomes.remove({});
  if (typeof genomesWithSeqHandle !== 'undefined') {
    console.log('stopping genomesWithSeqHandle subscription')
    genomesWithSeqHandle.stop()
  }
  genomesWithSeqHandle = Meteor.subscribe("genomesWithSeq");
  preferredDataset = dataset;
  Session.set("currentDataset", dataset);
  console.log("active dataset switched to:", dataset);
  Session.set("currentDataset", dataset);
  var preferredDataset = "Choose a Data Set";
  Meteor.call("updatePreferredDataset", dataset, function (error, result) {
    if (Meteor.user().preferredDataset) {
      preferredDataset = Meteor.user().preferredDataset;
    }
    Session.set("preferredDataset", preferredDataset)
    console.log("preferredDataset updated to", dataset)
  })
  usersThatCanView = getUsersThatCanView()
  Tracker.autorun(() => {
    autoCompleteUsers = getAutocompleteUsers()

    //console.log("rerunning autocomplete");
  $('input.autocomplete').autocomplete({
      //data: Session.get('usersThatCanViewAutocomplete'),
      data: autoCompleteUsers,
      limit: 20, // The max amount of results that can be shown at once. Default: Infinity.
      onAutocomplete: function(val) {
        var regExp = /\(([^)]+)\)/;
        var email = regExp.exec(val)[1];
        var id = Meteor.users.findOne({"emails.0.address": email})._id
        var currentDataset = Session.get('currentDataset');
        Meteor.call("addUserToRole", id, 'view', currentDataset, (error, result) => {
          //Roles.addUsersToRoles(id, ['view'], Session.get("currentDataset"))
          console.log("adding ", val, "to", currentDataset, "with id", id);
          getUsersThatCanView();
          $('input#autocomplete-input.autocomplete')[0].value = "";
        })
      },
      minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
    });
  })
}

  Meteor.startup(function() {
    // Here we can be sure the plugin has been initialized
    //if (Meteor.isCordova) { alert("start saving your pennies")}
    Session.set("datasetsOwn", []);
    Session.set("datasetsView", []);

    Meteor.subscribe('fullname');
    /*Meteor.subscribe('phameratorVersion', function () {
      Session.set("phameratorVersionNumber", PhameratorVersion.findOne().version)
    });*/
    Meteor.subscribe('featureDiscovery', function () {
      if (Meteor.user()) {
        console.log("Meteor.user().includeInDirectory", Meteor.user().includeInDirectory)
        if (Meteor.user().profile.includeInDirectory == null) {
          Materialize.toast('Please review your<a href="account">account settings</a>', 5000);
        }
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
      //console.log( md.os() );
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
  preferredDataset: function () {
    return Session.get("preferredDataset");
  },
  iAmOwner: function () {
    var own = Session.get("datasetsOwn");
    var current = Session.get("currentDataset");
    if (own != null && current != null) {
      return Session.get("datasetsOwn").includes(Session.get("currentDataset"));
    }
    else { return false }
  }
});

Template.nav.onCreated (function () {
})

Template.nav.onRendered (function () {
  // reload the nav template when a new user signs in
  // cleanup data upon new user logging in


  console.log("Template.nav.onRendered()")
  //$(".button-collapse").sideNav({
  //  menuWidth: 240, // Default is 240
  //  edge: 'left' // Choose the horizontal origin
  // closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
  //});

  // get only the datasets for which this user has owner and/or view permission
  Meteor.call("getDatasetsIView", (error, result) => {
    Session.set("datasetsView", result);
    console.log("datasetsView:", result);
  });

  Meteor.call("getDatasetsIOwn", (error, result) => {
    Session.set("datasetsOwn", result);
    console.log("datasetsOwn:", result);
  });

  Meteor.subscribe('files.images.all');
  Meteor.subscribe('fullname');
  //this.Images = new FilesCollection({collectionName: 'Images'});
  //Materialize.fadeInImage('#profilepic');

  //console.log("activating sideNav and dropdown");
  $(".button-collapse").sideNav();

  $(".sidenav-icon").sideNav({
    closeOnClick: true
  }); // http://materializecss.com/side-nav.html
  /*Meteor.subscribe("preferredDataset", function () {
    var preferredDataset = "Choose a Data Set";
    if (Meteor.user() && Meteor.user().preferredDataset) {
      switch_dataset(Meteor.user().preferredDataset)
    }
    Session.set("preferredDataset", preferredDataset)
  })*/

//Tracker.flush()

  // Side Navigation fix
  /*$('.side-nav li a').on('click', function(e) {
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
  });*/

});

Template.nav.events({
  "click #dropdown1": function (event, template) {
    switch_dataset(event.target.firstChild.data)
  },
})
