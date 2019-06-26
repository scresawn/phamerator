Template.datasetDropdown.onCreated(function () {

});

Template.datasetDropdown.onRendered(function () {
  console.log("Template.datasetDropdown.onRendered()")
  var self = this;

  Meteor.subscribe('allUsers');
  //this.autorun(() => {
    console.log("subscribing to datasets...");
    this.subscribe('datasets');
    //Datasets.find()

    console.log("subscribing to preferredDataset...");
    this.subscribe("preferredDataset", function () {
      if (Meteor.user() && Meteor.user().preferredDataset) {
        switch_dataset(Meteor.user().preferredDataset)
      }
      /*else {
        alert("no preferredDataset dataset defined")
      }*/
    })

    //console.log("subscriptionsReady()", this.subscriptionsReady())
    if (self.subscriptionsReady()) {
      Session.set("preferredDataset", preferredDataset)
      console.log("before:", Session.get("datasetsView"));
      Session.set("datasetsView", Datasets.find({}, {fields: {name:1}}).fetch())
      console.log("after:", Session.get("datasetsView"));

      console.log("subscriptionsReady!")
      /*Tracker.afterFlush(() => {
        waitForEl(".dropdown-trigger", function() {
          $(".dropdown-trigger").dropdown({ hover: false, constrainWidth: false })
          $('#editDataset').modal();
        });
        console.log("triggering dropdown");
        console.log("logging in?", Meteor.loggingIn())
        console.log("trigger:", $(".dropdown-trigger")[0]);
        console.log($("#dropdown1")[0]);

      })*/
    }
    else { console.log("subscriptions not ready yet")}
});

Template.datasetDropdown.onDestroyed(function () {
  console.log("Template.datasetDropdown.onDestroyed()")
  Session.keys = {};
});

Template.datasetDropdown.helpers({
  datasets: function () {
    console.log("datasets helper changed:", Datasets.find().fetch())
    waitForEl(".dropdown-trigger", function() {
      $(".dropdown-trigger").dropdown({ hover: false, constrainWidth: false })
      $('#editDataset').modal({
        ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
          $('#editDataset .modal-content').animate({ scrollTop: 0 }, "fast")
          console.log(modal, trigger);
        },
        complete: function() {
          console.log('editDataset modal closed');
          $(  'input#autocomplete-input.autocomplete')[0].value = "";
        }
      });
    })
    if (Datasets.find().fetch().length === 0) {
      Session.set("preferredDataset", "Loading . . .")
    }
    else {
      /*if (Meteor.user().preferredDataset != "") {
        Session.set("preferredDataset", Meteor.user().preferredDataset)
      }
      else {
        Session.set("preferredDataset", "Choose a Data Set")
      }*/
    }
    return Datasets.find().fetch();
  },
})
