Template.terms.onRendered(function () {
  console.log('rendered terms and data policy');
  //var toastElement = $('.toast').first()[0];
  //if (toastElement != null) toastElement.remove();
  $('.toast').fadeOut()
  setTimeout(function () {
    M.toast({html:"Links to the terms of use and privacy policy can be found at the bottom of every page"});
    //var toastElement = $('.toast').first()[0].remove();
  }, 1000);
  $("html, body").animate({ scrollTop: 0 }, "slow");
});
