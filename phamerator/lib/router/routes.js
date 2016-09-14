var subscriptions = new SubsManager();

if (Meteor.isClient) {
  Router.plugin('ensureSignedIn', {
    only: ['account', 'phages']
  });
}

Router.configure({
  layoutTemplate: 'masterLayout',
  //loadingTemplate: 'loading',
  notFoundTemplate: 'pageNotFound',
  //progressDebug : true,
  progress : true,
  yieldTemplates: {
    nav: {to: 'nav'},
    footer: {to: 'footer'}
  }
});

Router.map(function() {
  this.route('home', {
    path: '/'
  });
  this.route('phages', {
    loadingTemplate: 'loading',
    waitOn: function() {
      return subscriptions.subscribe('genomes');
    }
  });
  this.route('phamilies');
  this.route('domains');
  this.route('barChart');
  this.route('account');
});

//Routes
AccountsTemplates.configureRoute('changePwd');
AccountsTemplates.configureRoute('enrollAccount');
AccountsTemplates.configureRoute('forgotPwd');
AccountsTemplates.configureRoute('resetPwd');
AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('signUp');
AccountsTemplates.configureRoute('verifyEmail');