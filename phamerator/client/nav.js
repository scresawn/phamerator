Template.nav.rendered = function () {
  $(".button-collapse").sideNav();
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
};