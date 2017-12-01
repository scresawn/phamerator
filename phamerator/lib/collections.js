Meteor.startup(function () {
  // The correct way

  console.log("grounding genomes collection");
  //Genomes = new Ground.Collection("genomes");

//Genomes = new Ground.Collection("genomes");
  Genomes = new Meteor.Collection("genomes");

  Phams = new Meteor.Collection("phams");

  Proteins = new Meteor.Collection("proteins");

  Domains = new Meteor.Collection("domains");


  if (Meteor.isCordova && navigator.connection.type == 'WIFI') { Ground.Collection(Genomes); }

  var Schemas = {};

Schemas.Genome = new SimpleSchema({
  name: {
    type: String,
    label: "Name",
    max: 20
  },
  finder: {
    type: String,
    label: "Found By"
  },
  sequence: {
    type: String,
    label: "Genome Sequence",
    min: 0
  },
  genomelength: {
    type: Number,
    label: "Sequence Length"
  },
  isProphage: {
    type: Boolean,
    label: "Prophage",
    optional: true
  },
  GC: {
    type: Number,
    label: "GC %"
  },
  cluster: {
    type: String,
    label: "Cluster",
    max: 2
  },
  subCluster: {
    type: Number,
    label: "Subcluster"
  },
  dateFound: {
    type: Date,
    label: "Date Found",
    optional: true
  },
  selected: {
    type: Boolean,
    optional: true
  }
});

  Genomes.attachSchema(Schemas.Genome);
});

Images = new FilesCollection({
  collectionName: 'Images',
  storagePath: '/data/phamerator/uploads',
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload: function (file) {
    //console.log(file.size <= 10485760 && /png|jpg|jpeg/i.test(file.ext));
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    return true;
    if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.ext)) {
      return true;
    } else {
      return 'Please upload image, with size equal or less than 10MB';
    }
  }
});