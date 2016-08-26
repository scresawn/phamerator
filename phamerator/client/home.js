Template.home.onCreated(function() {
  //Meteor.subscribe('genomes');
  console.log("home template created");

});

Template.home.onRendered(function () {
   $(document).ready(function(){
       $('.carousel.carousel-slider').carousel({full_width: true});
    });
  });

/*Template.home.onRendered(function () {
   $(document).ready(function(){
    $('.collapsible').collapsible({
      accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
  });
});*/
