// set up Genomes collection
// publish just genome names and clusters

Meteor.publish("genomes", function (selectedGenomes) {
  return Genomes.find();
  //return Genomes.find({"phagename": {$in: selectedGenomes}});
});