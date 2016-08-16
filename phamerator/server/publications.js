// set up Genomes collection
// publish just genome names and clusters

Meteor.publish("genomes", function (selectedGenomes) {
  //return Genomes.find({cluster: {$in: ['A1','A2','A3']}});
  //return Genomes.find({}, {fields: {phagename: 1, genomelength: 1, genes: 1, cluster: 1, subcluster: 1}});
  return Genomes.find({}, {fields: {phagename: 1, genomelength: 1, genes: 1, cluster: 1, subcluster: 1}});
  //return Genomes.find({"phagename": {$in: selectedGenomes}});
});

Meteor.publish("genomesWithSeq", function (selectedGenomes) {
  console.log(selectedGenomes);
  return Genomes.find({"phagename": {$in: selectedGenomes}});
  //return Genomes.find({});
  //return Genomes.find({"phagename": {$in: selectedGenomes}});
});

Meteor.publish('files.images.all', function () {
  return Images.collection.find({});
});