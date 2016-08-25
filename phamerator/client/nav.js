//import "/imports/startup/server/mail-url.js";

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

    if (Meteor.isCordova) {
      if (navigator.connection.type !== 'wifi') {
        $('#connectionWarning').openModal();

      }
    }

    document.addEventListener("online", onOnline, false);

    function onOnline() {
      // Handle the online event
      if (Meteor.isCordova) {
        if (navigator.connection.type !== 'wifi') {
          $('#connectionWarning').openModal();

        }
      }
    }
  });
};