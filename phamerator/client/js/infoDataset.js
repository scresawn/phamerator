Template.infoDatasetModal.onRendered(function () {
  console.log("Template.infoDatasetModal.onRendered()");
  console.log("usersThatCanView", Session.get("usersThatCanView"))
});

Template.infoDatasetModal.onDestroyed(function () {
  console.log("Template.infoDatasetModal.onDestroyed()")
  $("#editDataset").remove();
})

Template.infoDatasetModal.helpers({
  currentDataset: function () {
    return Session.get("currentDataset");
  }
})

Template.infoDatasetModal.events({
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
