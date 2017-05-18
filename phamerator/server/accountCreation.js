Accounts.onCreateUser(function(options, user) {
  // Assigns first and last names to the newly created user object
  console.log('onCreateUser:', options, user);
  user.selectedData = {genomeMaps: []};
  user.featureDiscovery = ['geneTranslation'];
  user.name = options.profile.name;
  return user;
});