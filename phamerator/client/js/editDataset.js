getUsersThatCanView = function (user) {
  activeDataset = Session.get("currentDataset")
  var users = Roles.getUsersInRole('view', activeDataset).fetch()
  Session.set("usersThatCanView", users);
  return users;
}

getAutocompleteUsers = function () {
  users = Meteor.users.find({ 'profile.includeInDirectory': true }).fetch()
  autoCompleteUsers = {}
  users.forEach(user => {
    var email = user.emails[0].address;

    var key = user.name + " (" + email + ")";
    autoCompleteUsers[key] = null;
  })
  return autoCompleteUsers;
}

Template.editDatasetModal.onRendered(function () {
});

Template.editDatasetModal.onDestroyed(function () {
  $("#editDataset").remove();
})

Template.editDatasetModal.helpers({
  usersThatCanView: function () {

    var users = Session.get("usersThatCanView");

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
    id = Meteor.users.findOne({ name: name })._id;
    // Call a meteor method to remove this user from the role
    Meteor.call("removeUserFromRole", id, 'view', Session.get("currentDataset"), (error, result) => {
      getUsersThatCanView();
    });
  }
});
