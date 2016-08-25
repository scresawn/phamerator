Meteor.methods({
  "userExists": function(username){
    return !!Meteor.users.findOne({username: username});
  },
  "updateSelectedData": function(phagename, addGenome) {
    console.log('updateSelectedData called with', phagename, addGenome);
    genomeMaps = Meteor.users.findOne({_id: Meteor.userId()}, {fields: {"selectedData.genomeMaps": 1}}).selectedData.genomeMaps;
    console.log(genomeMaps);

    if (addGenome === true && genomeMaps.indexOf(phagename) === -1) {
      genomeMaps.push(phagename);
      Meteor.users.upsert({_id: Meteor.userId()},{ $set: {"selectedData.genomeMaps": genomeMaps}});
    }
    else if (addGenome === false) {
      console.log("removing", phagename, "from", genomeMaps);
      var index = genomeMaps.indexOf(phagename);
      if (index > -1) {
        genomeMaps.splice(index, 1);
        Meteor.users.upsert({_id: Meteor.userId()},{ $set: {"selectedData.genomeMaps": genomeMaps}});
      }
    }
  },
  sendVerificationLink() {
    let userId = Meteor.userId();
    if ( userId ) {
      return Accounts.sendVerificationEmail( userId );
    }
  }
});