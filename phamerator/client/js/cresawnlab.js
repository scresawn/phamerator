Template.cresawnlab.onCreated(function() {
  console.log("cresawnlab template created");
});

Template.cresawnlab.onRendered(function () {
  $(document).ready(function(){
    $('.parallax').parallax()
  });
  $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.cresawnlab.helpers({

});
