Template.nav.rendered = function () {
  $(".button-collapse").sideNav({
    menuWidth: 240, // Default is 240
    edge: 'left' // Choose the horizontal origin
   // closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
  });
  // Side Navigation fix
  $('.side-nav li a').on('click', function(e) {
    windowsize = $(window).width();
    if (windowsize < 992) {
        //$('.button-collapse', this).sideNav('hide');
      window.setTimeout(function(){
        $('.button-collapse', this).sideNav('hide');
      }, 1000);
    }
  });
  Meteor.startup(function() {
    // Here we can be sure the plugin has been initialized
    //if (Meteor.isCordova) { alert("start saving your pennies")}
    if (Meteor.isCordova) {alert(navigator.connection.type)};
  });
};