Template.home.onCreated(function() {
  //Meteor.subscribe('genomes');
  console.log("home template created");

});

Template.home.onRendered(function () {
   $(document).ready(function(){
     //h = $(document).height() - $('nav').height();
     //console.log(h);
     //$('.carousel.carousel-slider').carousel({fullWidth: true});
     //$('.carousel.carousel-slider').height(h);
     $('.parallax').parallax()
     //setTimeout(function() {$('.parallax').parallax()}, 5000);
   });
  });

/*Template.home.onRendered(function () {
   $(document).ready(function(){
    $('.collapsible').collapsible({
      accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
  });
});*/
