import { Meteor } from 'meteor/meteor';
import { FilesCollection } from 'meteor/ostrio:files';

Meteor.startup(function () {

  console.log("grounding genomes collection");

  //Genomes = new Ground.Collection("genomes");
  Phams =    new Mongo.Collection("phams");
  Proteins = new Mongo.Collection("proteins");
  Domains =  new Mongo.Collection("domains");
  Datasets = new Mongo.Collection("datasets");

  if (Meteor.isCordova && navigator.connection.type == 'WIFI') { Ground.Collection(Genomes); }



Images = new FilesCollection({
  collectionName: 'Images',
  storagePath: '/data/phamerator/uploads',
  allowClientCode: false, // Disallow remove files from Client
  debug: true,
  onBeforeUpload: function (file) {
    //console.log(file.size <= 10485760 && /png|jpg|jpeg/i.test(file.ext));
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    return true;
    if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.extension)) {
      return true;
    } else {
      return 'Please upload image, with size equal or less than 10MB';
    }
  }
});
});
