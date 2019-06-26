//var subscriptions = new SubsManager();

if (Meteor.isClient) {
  Router.plugin('ensureSignedIn', {
    only: ['account', 'phages']
  });
}

Router.configure({
  layoutTemplate: 'masterLayout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'pageNotFound',
  //progressDebug : true,
  progress : true,
  progressSpinner : false,
  yieldTemplates: {
    nav: {to: 'nav'},
    footer: {to: 'footer'}
  }
});

Router.map(function() {
  this.route('home', {
    path: '/',
    loadingTemplate: 'loading',
    waitOn: function() {
      return [Meteor.subscribe('allUsers')];
    }
  });
  this.route('phages', {
    //loadingTemplate: 'loading',
    waitOn: function () {
      dataset = Session.get('currentDataset');
      return Meteor.subscribe('genomes', dataset);
    }
    //waitOn: function() {
    //  console.log('running onBeforeAction()');
      // if(Meteor.isClient && Meteor.user() && Meteor.user().selectedData) {
      //   //console.log('ROUTES: getting dataset')
      //   dataset = Session.get('currentDataset');
      //   //while (dataset == undefined) { setTimeout(100, function () {}) }
      //   //console.log('ROUTES: dataset is', dataset);
      //
      //   // wrap Meteor.subscribe calls in this.wait()
      //   // and then use this.ready()?
      //   //console.log('ROUTES: subscribing to genomes')
      //   this.subscribe('genomes', dataset).wait();
      //   //console.log('ROUTES: subscribing to selectedData')
      //   this.subscribe('selectedData', dataset).wait();
      //   console.log('selectedData', Meteor.user().selectedData)
      //   //console.log('ROUTES: getting names', Meteor.user())
      //   if (dataset && Meteor.user() && Meteor.user().selectedData && Meteor.user().selectedData[dataset] && Meteor.user().selectedData[dataset].genomeMaps) {
      //     ///names = Meteor.user().selectedData[dataset].genomeMaps;
      //     //console.log('ROUTES: subscribing to genomesWithSeq')
      //     ///this.subscribe("genomesWithSeq", dataset, names).wait();
      //     //console.log('ROUTES: subscribing to allUsers')
      //     this.subscribe('allUsers').wait();
      //   }
      //   this.next();
      // }
    //},
    // onAfterAction: function () {
    //   console.log("running onAfterAction()");
    // },
    //fastRender: true
  });
  this.route('phamilies');
  this.route('newDatabase');
  this.route('cresawnlab');
  this.route('domains');
  this.route('terms');
  this.route('account', {
    loadingTemplate: 'loading',
    waitOn: function() {
      return [Meteor.subscribe('files.images.all'), Meteor.subscribe('fullname')];
    }
  });
});

//Routes
AccountsTemplates.configureRoute('changePwd');
AccountsTemplates.configureRoute('enrollAccount');
AccountsTemplates.configureRoute('forgotPwd');
AccountsTemplates.configureRoute('resetPwd');
AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('signUp');
AccountsTemplates.configureRoute('verifyEmail');
