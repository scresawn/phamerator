// set up Genomes collection
// publish just genome names and clusters

Meteor.publish("genomes", function (selectedGenomes) {
  //return Genomes.find({cluster: {$in: ['A1','A2','A3']}});
  return Genomes.find({});
  //return Genomes.find({"phagename": {$in: selectedGenomes}});
});

Meteor.publish('files.images.all', function () {
  return Images.collection.find({});
});