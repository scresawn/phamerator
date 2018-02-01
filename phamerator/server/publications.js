// set up Genomes collection
// publish just genome names and clusters

Meteor.publish("genomes", function () {
  console.log('genomes');
  return Genomes.find({}, {fields: {phagename: 1, genomelength: 1, cluster: 1, subcluster: 1}});
});

Meteor.publish("genomesWithSeq", function (selectedGenomes) {
  //console.log(selectedGenomes);
  return Genomes.find({"phagename": {$in: selectedGenomes}});
  //return Genomes.find({});
  //return Genomes.find({"phagename": {$in: selectedGenomes}});
});

Meteor.publish("proteinSeq", function (phagename) {
  //console.log(selectedProtein, " selected");
  return Proteins.find({"phagename": phagename});
});

Meteor.publish('files.images.all', function () {
  return Images.collection.find({});
});

Meteor.publish('selectedData', function() {
  return Meteor.users.find({_id: this.userId}, {fields: {selectedData: 1}});
});

Meteor.publish('featureDiscovery', function() {
  return Meteor.users.find({_id: this.userId}, {fields: {featureDiscovery: 1}});
});

Meteor.publish('newTermsAndPolicies', function() {
  return Meteor.users.find({_id: this.userId}, {fields: {newTermsAndPolicies: 1}});
});

Meteor.publish('fullname', function () {
  return Meteor.users.find({_id: this.userId}, {fields: {name: 1}});
});

Meteor.users.find({ "status.online": true }).observe({
  added: function(id) {
    // id just came online
    console.log(new Date().toLocaleString(), "[ONLINE]:  ", id.username, "(" + id.name + ")", id.emails[0]);
  },
  removed: function(id) {
    // id just went offline
    console.log(    new Date().toLocaleString(), "[OFFLINE]: ", id.username, "(" + id.name + ")", id.emails[0]);
  }
});
