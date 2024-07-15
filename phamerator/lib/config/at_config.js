AccountsTemplates.removeField('email');
AccountsTemplates.removeField('password');

AccountsTemplates.addField({
  _id: 'name',
  type: 'text',
  required: true,
  displayName: "Full Name",
  func: function (value) { return value === ''; },
  errStr: 'Please enter your full name'
});

AccountsTemplates.addField({
  _id: 'username',
  type: 'text',
  required: true,
  func: function (value) {
    if (Meteor.isClient) {
      var self = this;
      Meteor.call("userExists", value, function (err, userExists) {
        if (!userExists)
          self.setSuccess();
        else
          self.setError("This username is already taken. Please try something else.");
        self.setValidating(false);
      });
    }
  }
});

AccountsTemplates.addField({
  _id: 'email',
  type: 'email',
  required: true,
  displayName: "College/University-provided email address",
  re: /.+@(.+){2,}\.(.+){2,}/, // anything that looks like an email
  //re: /.+@(.+)\.(edu|org)/, // this forces .edu or .org email addresses
  //re: /.+@(.+){2,}\.edu/, // this forces use of .edu email address
  errStr: 'Please use the email provided by your college/university',
});

AccountsTemplates.addField({
  _id: 'password',
  type: 'password',
  required: true,
  minLength: 8,
  re: /^(?=^.{6,}$)(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).*$/,
  errStr: 'Must contain at least 1 digit, 1 symbol, 1 lowercase, and 1 uppercase character'
});

// Options
AccountsTemplates.configure({
  // defaultLayout: 'emptyLayout',
  showForgotPasswordLink: true,
  overrideLoginErrors: true,
  enablePasswordChange: true,
  showResendVerificationEmailLink: true,
  sendVerificationEmail: true,
  //enforceEmailVerification: true,
  //confirmPassword: true,
  continuousValidation: true,
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
});
