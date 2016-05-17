Router.configure({
  layoutTemplate: 'masterLayout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'pageNotFound',
  yieldTemplates: {
    nav: {to: 'nav'},
    footer: {to: 'footer'},
  }
});

Router.map(function() {
  this.route('home', {
    path: '/',
  });
  this.route('phages');
  this.route('phamilies');
  this.route('domains');
  this.route('barChart');
  this.route('account');
});

if (Meteor.isClient) {
  Router.plugin('ensureSignedIn', {
    only: ['account']
  });
}

//Routes
AccountsTemplates.configureRoute('changePwd');
AccountsTemplates.configureRoute('enrollAccount');
AccountsTemplates.configureRoute('forgotPwd');
AccountsTemplates.configureRoute('resetPwd');
AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('signUp');
AccountsTemplates.configureRoute('verifyEmail');