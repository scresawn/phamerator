AccountsTemplates.addField({
  _id: 'username',
  type: 'text',
  required: true,
  func: function(value){
    if (Meteor.isClient) {
      console.log("Validating username...");
      var self = this;
      Meteor.call("userExists", value, function(err, userExists){
        if (!userExists)
          self.setSuccess();
        else
          self.setError(userExists);
        self.setValidating(false);
      });
      return;
    }
    // Server
    return Meteor.call("userExists", value);
  },
});

// Options
AccountsTemplates.configure({
  // defaultLayout: 'emptyLayout',
  showForgotPasswordLink: true,
  overrideLoginErrors: true,
  enablePasswordChange: true,

  // sendVerificationEmail: true,
  // enforceEmailVerification: true,
  //confirmPassword: true,
  //continuousValidation: false,
  //displayFormLabels: true,
  //forbidClientAccountCreation: true,
  //formValidationFeedback: true,
  //homeRoutePath: '/',
  //showAddRemoveServices: false,
  //showPlaceholders: true,

  negativeValidation: true,
  positiveValidation: true,
  negativeFeedback: false,
  positiveFeedback: true,

  // Privacy Policy and Terms of Use
  //privacyUrl: 'privacy',
  //termsUrl: 'terms-of-use',
});