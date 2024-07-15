switch_dataset = function (dataset) {
  selectedGenomes.remove({});
  if (typeof genomesWithSeqHandle !== 'undefined') {
    genomesWithSeqHandle.stop()
  }
  genomesWithSeqHandle = Meteor.subscribe("genomesWithSeq");
  preferredDataset = dataset;
  Session.set("currentDataset", dataset);
  Session.set("currentDataset", dataset);

  var preferredDataset = "Choose a Data Set";
  Meteor.call("updatePreferredDataset", dataset, function (error, result) {
    if (Meteor.user().preferredDataset) {
      preferredDataset = Meteor.user().preferredDataset;
    }
    Session.set("preferredDataset", preferredDataset)
  })
  usersThatCanView = getUsersThatCanView()
  Tracker.autorun(() => {
    autoCompleteUsers = getAutocompleteUsers()

    $('input.autocomplete').autocomplete({
      data: autoCompleteUsers,
      limit: 20, // The max amount of results that can be shown at once. Default: Infinity.
      onAutocomplete: function (val) {
        var regExp = /\(([^)]+)\)/;
        var email = regExp.exec(val)[1];
        var id = Meteor.users.findOne({ "emails.0.address": email })._id
        var currentDataset = Session.get('currentDataset');

        Meteor.call("addUserToRole", id, 'view', currentDataset, (error, result) => {
          getUsersThatCanView();
          $('input#autocomplete-input.autocomplete')[0].value = "";
        })
      },
      minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
    });
  })

  genomesWithSeqHandlers.map(handler => handler.stop())
  genomesWithSeqHandlers = [];

  //all the subscriptions that have been subscribed.
  var subs = Meteor.default_connection._subscriptions;
  var subSummary = {};

  // organize them by name so that you can see multiple occurrences
  Object.keys(subs).forEach(function (key) {
    var sub = subs[key];
    // you could filter out subs by the 'active' property if you need to
    if (subSummary[sub.name] && subSummary[sub.name].length > 0) {
      subSummary[sub.name].push(sub);
    } else {
      subSummary[sub.name] = [sub];
    }
  });
}

Meteor.startup(function () {
  // Here we can be sure the plugin has been initialized
  Session.set("datasetsOwn", []);
  Session.set("datasetsView", []);

  Meteor.subscribe('fullname');
  Meteor.subscribe('featureDiscovery', function () {
    if (Meteor.user()) {
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
  });


  if (Meteor.isCordova) {
    if (navigator.connection.type !== 'wifi') {
      $('#connectionWarning').openModal();
    }
  }
  else {
    import MobileDetect from 'mobile-detect';
    var md = new MobileDetect(window.navigator.userAgent);
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
  displayname: function () {
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
    user = Images.collection.findOne({ _id: Meteor.user() })
    if (user && user.hasOwnProperty('profile') && user.profile.hasOwnProperty('profilePic')) {
      profile = user.profile;
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
  },
  metadata: function () {
    // check to see if currentDataset has a metadata field and return it
    return Datasets.findOne({ name: Session.get("currentDataset") });
  },
  now: function () {
    let d = new Date()
    return d.getFullYear()
  }
});

Template.nav.onCreated(function () {
})

Template.nav.onRendered(function () {
  // reload the nav template when a new user signs in
  // cleanup data upon new user logging in

  // get only the datasets for which this user has owner and/or view permission
  Meteor.call("getDatasetsIView", (error, result) => {
    Session.set("datasetsView", result);
  });

  Meteor.call("getDatasetsIOwn", (error, result) => {
    Session.set("datasetsOwn", result);
  });

  Meteor.subscribe('files.images.all');
  Meteor.subscribe('fullname');

  $(".button-collapse").sideNav();

  $(".sidenav-icon").sideNav({
    closeOnClick: true
  }); // http://materializecss.com/side-nav.html

});

Template.nav.events({
  "click #dropdown1": function (event, template) {
    switch_dataset(event.target.firstChild.data)
  },
})
