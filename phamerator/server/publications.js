// set up Genomes collection
// publish just genome names and clusters

Meteor.publish("allUsers", function () {
  return Meteor.users.find({ 'profile.includeInDirectory': true }, { fields: { name: 1, emails: 1, roles: 1, username: 1, profile: 1 } });
})


Meteor.publishComposite("genomes", function (dataset) {
  return {
    find: function () {
      return Datasets.find({ 'name': { $in: Roles.getGroupsForUser(this.userId, "view") } });
    },
    children: [{
      find: function () {
        if (!Roles.getGroupsForUser(this.userId, "view").includes(dataset)) {
          return;
        }
        return Genomes.find({ dataset: dataset }, { fields: { phageID: 1, phagename: 1, genomelength: 1, cluster: 1, subcluster: 1, dataset: 1 } });
      }
    }]
  }
});

Meteor.publish("domains", function (dataset) {
  if (dataset) {
    return Domains.find({ dataset: dataset })
  }
  else {
    return this.stop()
  }
})

Meteor.publish("selected_tRNAs", function (dataset, selectedGenomes) {
  if (dataset) {
    var datasets = Roles.getGroupsForUser(this.userId, "view")
    if (!datasets.includes(dataset)) { return [] }

    return TRNAs.find({ "PhageID": { $in: selectedGenomes }, dataset: dataset });
  }
  else {
    return this.stop();
  }
})

Meteor.publish("genomesWithSeq", function (dataset, selectedGenomes) {
  if (dataset) {
    var datasets = Roles.getGroupsForUser(this.userId, "view")
    if (!datasets.includes(dataset)) { return [] }

    return Genomes.find({ "phagename": { $in: selectedGenomes }, dataset: dataset });
  }
  else {
    return this.stop();
  }
});

Meteor.publish("proteinSeq", function (phagename) {
  return Proteins.find({ "phagename": phagename });
});

Meteor.publishComposite("datasets", {
  find: function () {
    return Meteor.users.find({ _id: this.userId });
  },
  children: [{
    find: function () {
      return Datasets.find({ "name": { $in: Roles.getGroupsForUser(this.userId, "view") } });
    }
  }]
});

Meteor.publish('preferredDataset', function () {
  return Meteor.users.find({ _id: this.userId }, { fields: { preferredDataset: 1 } });
});

Meteor.publish('files.images.all', function () {
  return Images.find().cursor;
});

Meteor.publish('selectedData', function () {
  return Meteor.users.find({ _id: this.userId }, { fields: { selectedData: 1 } });
});

Meteor.publish('featureDiscovery', function () {
  return Meteor.users.find({ _id: this.userId }, { fields: { featureDiscovery: 1 } });
});

Meteor.publish('newTermsAndPolicies', function () {
  return Meteor.users.find({ _id: this.userId }, { fields: { newTermsAndPolicies: 1 } });
});

Meteor.publish('fullname', function () {
  return Meteor.users.find({ _id: this.userId }, { fields: { name: 1 } });
});

Meteor.publish('phameratorVersion', function () {
  return PhameratorVersion.find({}, { fields: { version: 1 } });
});

Meteor.users.find({ "status.online": true }).observe({
  added: function (id) {
    // console.log(new Date().toLocaleString(), "[ONLINE]:  ", id.username, "(" + id.name + ")", id.emails[0]);
  },
  removed: function (id) {
    // console.log(new Date().toLocaleString(), "[OFFLINE]: ", id.username, "(" + id.name + ")", id.emails[0]);
  }
});
