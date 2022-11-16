Accounts.onCreateUser(function (options, user) {
  // Assigns first and last names to the newly created user object
  console.log('onCreateUser:', options, user);
  user.featureDiscovery = ['geneTranslation', 'phamMembersByCluster', 'phamAbundance', 'geneNotes'];
  user.newTermsAndPolicies = true;
  user.name = options.profile.name;
  user.roles = { 'Actino_Draft': ['view'] };
  user.preferredDataset = 'Actino_Draft'
  user.profile = {};
  user.GenesDB_assigned_genomes = [];
  user.selectedData = {
    "Actino_Draft": {
      "genomeMaps": []
    }
  }

  return user;
});
