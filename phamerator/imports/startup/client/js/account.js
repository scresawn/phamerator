/**
 * Created by steve on 3/30/16.
 */

Template.account.onRendered(function () {
  $("html, body").animate({ scrollTop: 0 }, "slow");

  //Meteor.subscribe('files.images.all');
  //Meteor.subscribe('fullname');
  //this.Images = new FilesCollection({collectionName: 'Images'});

  /*var slider = document.getElementById('range-input');
  noUiSlider.create(slider, {
    start: [20, 80],
    connect: true,
    step: 1,
    range: {
      'min': 0,
      'max': 100
    },
    format: wNumb({
      decimals: 0
    })
  });*/
  //Materialize.fadeInImage('#profilepic');

  /*setTimeout(function () {
    Materialize.fadeInImage('#profilepic')
  }, 1500);*/
});

Template.account.helpers({
  email: function() {
    return Meteor.user() ? Meteor.user().emails[0].address : null;
  },
  username: function() {
    return Meteor.user() ? Meteor.user().username : null;
  },
  name: function () {
    return Meteor.user() ? Meteor.user().name : null;
  },
  includeInDirectory: function () {
    return Meteor.user() ? Meteor.user().profile.includeInDirectory : null;
  }
});

Template.account.events({
  "change #directoryinfo-yes": function () {
    console.log("opt in :)")
    Meteor.users.update({_id: Meteor.user()._id},{$set: {'profile.includeInDirectory': true}});;
    //getAutocompleteUsers()
  },
  "change #directoryinfo-no": function () {
    console.log("opt out :(")
    Meteor.users.update({_id: Meteor.user()._id},{$set: {'profile.includeInDirectory': false}});;
    //getAutocompleteUsers()
  }
})

Template.uploadForm.onCreated(function () {
  this.currentUpload = new ReactiveVar(false);
});

Template.uploadForm.helpers({
  currentUpload: function () {
    return Template.instance().currentUpload.get();
  }
});

Template.uploadForm.events({
  'change #fileInput': function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // multiple files were selected
      var upload = Images.insert({
        file: e.currentTarget.files[0],
        streams: 'dynamic',
        chunkSize: 'dynamic',
      }, false);

      upload.on('start', function () {
        template.currentUpload.set(this);
      });

      upload.on('end', function (error, fileObj) {
        if (error) {
          alert('Error during upload: ' + error);
        } else {
          console.log(Meteor.user().name, 'uploaded picture', fileObj._id)
          Meteor.users.update({_id: Meteor.user()._id}, {$set: {"profile.profilePic": fileObj._id}});
        }
        template.currentUpload.set(false);
      });
      upload.start();
    }
  }
});

Template.file.helpers({
  /*imageFile: function () {
    return Images.collection.find().fetch()
    //return Images.collection.findOne()
  },*/
  imageFile: function () {
    user = Meteor.user();
    if (user && user.hasOwnProperty('profile') && user.profile.hasOwnProperty('profilePic')) { profile = user.profile;
      profilePic = user.profile.profilePic;
    }
    return Images.collection.findOne({userId: user._id, _id: profilePic})

    /*user = Meteor.user();
    if (user && user.hasOwnProperty('profile') && user.profile.hasOwnProperty('profilePic')) { profile = user.profile;
      profilePic = user.profile.profilePic;
    }
    else profilePic = "";
    return profilePic;*/
  },
  videoFile: function () {
    return Videos.collection.findOne({});
  }
});
