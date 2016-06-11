Genomes = new Meteor.Collection("genomes");

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

Images = new FilesCollection({
  collectionName: 'Images',
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload: function (file) {
    console.log(file.size <= 10485760 && /png|jpg|jpeg/i.test(file.ext));
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    return true;
    if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.ext)) {
      return true;
    } else {
      return 'Please upload image, with size equal or less than 10MB';
    }
  }
});