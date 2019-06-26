// ensure that all accounts have all needed fields
Meteor.startup(function () {
  Accounts.onLogout(function () {
    console.log("logout!")
  })
  // get all datasets
  //var datasets = Datasets.find().fetch();

  // for each dataset, ensure that the owner has "view", "edit", and "share" roles
  // for each dataset
  //datasets.forEach(function(dataset) {
  //console.log("dataset:", dataset);

    // get owner
      // add view, edit, and assign roles to owner for this dataset
    // get the owner's username
    // Roles.addUsersToRoles(owner, ['view','edit','share', dataset-name)
  //});

    // for the default dataset, ensure all users can view it
    //Roles.addUsersToRoles(Meteor.users.find().fetch(), 'view', 'Actino_Draft')
})
