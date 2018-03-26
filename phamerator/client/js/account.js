/**
 * Created by steve on 3/30/16.
 */

Template.account.onRendered(function () {
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
  Materialize.fadeInImage('#profilepic');

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
  }
});

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
        chunkSize: 'dynamic'
      }, false);

      upload.on('start', function () {
        template.currentUpload.set(this);
      });

      upload.on('end', function (error, fileObj) {
        if (error) {
          alert('Error during upload: ' + error);
        } else {
          Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.profilePic": fileObj._id}});
        }
        template.currentUpload.set(false);
      });
      upload.start();
    }
  }
});

Template.file.helpers({
  imageFile: function () {
    user = Images.collection.findOne({_id: Meteor.user()})
    if (user && user.hasOwnProperty('profile') && user.profile.hasOwnProperty('profilePic')) { profile = user.profile;
      profilePic = user.profile.profilePic;
    }
    else profilePic = "";
    return profilePic;
  },
  videoFile: function () {
    return Videos.collection.findOne({});
  }
});
