Accounts.onCreateUser(function(options, user) {
  // Assigns first and last names to the newly created user object
  user.selectedData = {genomeMaps: []};
  // Returns the user object
  return user;
});