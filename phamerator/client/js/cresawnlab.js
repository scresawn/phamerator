Template.cresawnlab.onCreated(function () {
});

Template.cresawnlab.onRendered(function () {
  $(document).ready(function () {
    $('.parallax').parallax()
  });
  $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.cresawnlab.helpers({

});
