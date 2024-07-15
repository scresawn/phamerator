// ensure that all accounts have all needed fields
Meteor.startup(function () {
  Accounts.onLogout(function () {
  })
  // get all datasets
  var datasets = Datasets.find().fetch();

  // for each dataset, ensure that the owner has "view", "edit", and "share" roles
  // for each dataset
  datasets.forEach(function (dataset) {

  });

})
