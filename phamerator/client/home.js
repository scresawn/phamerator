Template.home.onCreated(function() {
  //Meteor.subscribe('genomes');
  console.log("home template created");

});

Template.home.onRendered(function(){
    $(document).ready(function (){
        $('.carousel').carousel();

    });
});




/*Template.home.helpers({
    text: function(){
        return `<ul id='dropdown1' class='dropdown-content'>
                    <li class = 'bullet'>When first starting the app, this page will be present.</li>
                    <li class = 'bullet'>To the left is the Navigation Bar, which contains the tabs Home, Genome Maps, Repeats, and Account.</li>
                    <li class = 'bullet'>To switch to different page in the app, select the tab on the left that you want to view.</li>
                    <li class = 'bullet'>If you have any questions, please don’t hesitate to click the GitHub link and submit them!</li>
                </ul>`;
    }
});*/


Template.home.events({
   "mousedown"(event){
       //console.log("click");
       Session.set("carouselSelection", event.target.id);
       //console.log(event.target.id);
   }
});


Template.home.helpers({
    helptext: function(){
        carousel = {
            startingOff : 'To the left is the Navigation Bar, which contains the tabs Home, Genome Maps and Account.To switch to different pages in the app, select the tab on the left that you want to view. If you have any questions, please don’t hesitate to click the GitHub link and submit them!'
            ,

            account : 'Select the Account tab. Enter username and password. If you are new and do not have a username or password, select Register at the bottom of the screen. Enter in your desired username and password. Passwords MUST match, or else an error will occur. Once all information is entered, select Register. A confirmation email will be sent to the email provided.'
            ,

            selectingMaps : 'Select the Genome Maps tab. Select your desired phages under “Select Phages”, either by cluster (i.e. check box in the white tab) or by individual phage (select the white tab to get individual phages). Click “View Map” when you are ready to see the maps of your phages. Select Clear Selection to clear the phages.'
            ,

            resortingMaps : 'The maps may take a minute to load because of information that needs to be downloaded. To rearrange your phages, click and drag them to the desired location.'
            ,

            downloadingMaps : 'Click on the teal hamburger menu. Select the purple “download” button. To view immediately in the browser, click the download button. To save the svg onto the computer with a different name, right click the download button and rename it, and save it to your desired file.'
            ,
        };
        return carousel[Session.get("carouselSelection")];
    },
    account:function(){
    console.log("account clicked");
}
});





//Template.home.onRendered(function() {
  //  console.log("carouselItem1 clicked");
   // $(document).ready(function() {return ();
//});
//});



