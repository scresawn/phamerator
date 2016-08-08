var subscriptions = new SubsManager();


Router.configure({
  layoutTemplate: 'masterLayout',
  //loadingTemplate: 'loading',
  notFoundTemplate: 'pageNotFound',
  //progressDebug : true,
  progress : true,
  yieldTemplates: {
    nav: {to: 'nav'},
    footer: {to: 'footer'},
  }
});

Router.map(function() {
  this.route('home', {
    path: '/',
  });
  this.route('phages', {
        loadingTemplate: 'loading',
        waitOn: function () {
          return subscriptions.subscribe('genomes');
        },
        //subscriptions: function() {
        // returning a subscription handle or an array of subscription handles
        // adds them to the wait list.
        //  return Meteor.subscribe('genomes');
        //},
        //action: function () {
        //  this.render('phages');
        //}
        //action: function () {
        //  if (this.ready()) {
        //    this.render();
        //  }
        //  else { this.render('loading');}
        //}
        //data: function () {
        //  templateData = { authors: Authors.find() };
        //  return templateData;
      }
  );
  this.route('phamilies');
  this.route('domains');
  this.route('barChart');
  this.route('account');
  this.route('repeats', {
    loadingTemplate: 'loading',
    waitOn: function () {
      return subscriptions.subscribe('genomes');
    }
  });
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