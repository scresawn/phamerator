Accounts.onCreateUser(function(options, user) {
  // Assigns first and last names to the newly created user object
  console.log('onCreateUser:', options, user);
  //need to create a dataset object under selectedData for each dataset when shared
  //user.selectedData = {genomeMaps: []};
  user.featureDiscovery = ['geneTranslation', 'phamMembersByCluster', 'phamAbundance', 'geneNotes'];
  user.newTermsAndPolicies = true;
  user.name = options.profile.name;

  //Roles.addUsersToRoles(joesUserId, 'view', 'Actino_Draft')
  return user;
});
