getUsersThatCanView = function (user) {
  //console.log("getting usersThatCanView");
  activeDataset = Session.get("currentDataset")
  var users = Roles.getUsersInRole('view', activeDataset).fetch()
  //console.log("usersThatCanView:", users, activeDataset);
  Session.set("usersThatCanView", users);
  return users;
}

getAutocompleteUsers = function () {
  console.log("getAutocompleteUsers()")
  activeDataset = Session.get("currentDataset")
  users = Meteor.users.find({'profile.includeInDirectory': true}).fetch()
  autoCompleteUsers = {}
  users.forEach(user => {
    var email = user.emails[0].address;
    //email = email.split("@")[1]



    var key = user.name + " (" + email + ")";
    //console.log("key:", key);
    autoCompleteUsers[key] = null;
  })
  Session.set("usersThatCanViewAutocomplete", autoCompleteUsers);
  return autoCompleteUsers;
}

Template.editDatasetModal.onRendered(function () {
  console.log("Template.editDatasetModal.onRendered()");
  console.log("usersThatCanView", Session.get("usersThatCanView"))
});

Template.editDatasetModal.onDestroyed(function () {
  console.log("Template.editDatasetModal.onDestroyed()")
  $("#editDataset").remove();
})

Template.editDatasetModal.helpers({
  usersThatCanView: function () {

    var users = Session.get("usersThatCanView");

    //var owner = Datasets.findOne({name: Session.get("currentDataset")}).owner
    var owner = Meteor.user();
    if (users != null) {
      viewers = users.filter(function (u) {
        return u._id !== owner._id
      })
      return viewers;
    }
    return [];
  },
  currentDataset: function () {
    return Session.get("currentDataset");
  },
  owner: function () {
    return Meteor.user();

  }
})

Template.editDatasetModal.events({
  "click div.chip > i": function (e, template) {
    var name = e.target.parentNode.firstChild.nodeValue;
    id = Meteor.users.findOne({name: name})._id;
    console.log("removing 'view' role for", id);
    // Call a meteor method to remove this user from the role
    Meteor.call("removeUserFromRole", id,'view', Session.get("currentDataset"), (error, result) => {
      getUsersThatCanView();
    });
  }
});
