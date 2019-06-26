Template.phages.helpers({
  //clusters: function () { return []; },
  selectedGenomes: function () {
    // local collections are not reactive, apparently
    console.log('HELPER: selectedGenomes')
    //gws = Meteor.user().selectedData[Session.get('currentDataset')].genomeMaps
    //return Session.get('selectedPhages')
    //gws = Session.get('selectedPhages')
    const gws = Genomes.find({sequence: {$exists: true}}).fetch();
    gws.forEach(function (genome, index, array) {
      console.log('genome:', genome);
      selectedGenomes.insert(genome);
    })
    console.log(selectedGenomes.find().fetch());
    //update_phages();
    //update_hsps(hspData);
    $("#preloader").fadeOut(300).hide();
    return Genomes.find({sequence: {$exists: true}})
  },
  clusters: function() {
    console.log('HELPER: clusters')
    return Session.get('clusters');
  },
  domainQuery: function () {
    console.log('HELPER: domainQuery');
    return "https://www.ncbi.nlm.nih.gov/Structure/cdd/cddsrv.cgi?uid=" },
  selectedDomains: function () {
    console.log('HELPER: selectedDomains');
    return Session.get ('selectedDomains')},

  newFeature: function () {
    console.log('HELPER: newFeature');
    if (Meteor.user().featureDiscovery.length > 0) {
      Session.set('newFeature', true);
      return true;
    }
    Session.set('newFeature', false);
    return false
  },
  geneTranslation: function () {
    console.log('HELPER: geneTranslation');
    return Session.get('geneTranslation'); },
  phamAbundanceFD: function () {
    console.log('HELPER: phamAbundanceFD');
    return Session.get('phamAbundanceFD'); },

  // /selectedGenomes: function () {
  // /  console.log('HELPER: selectedGenomes');
  // /  return Genomes.find({sequence: {$exists: true}})},
  selectedGeneTitle: function () { return Session.get('selectedGeneTitle')},
  selectedGene: function () {
    return Session.get('selectedGene');
  },
  selectedGeneNotes: function () { return Session.get('selectedGeneNotes'); },
  selectedProtein: function () {
    return Session.get('selectedProtein');
  },
  selectedClusters: function () {
    console.log('HELPER: selectedClusters');
    return Session.get('selectedClusters'); },
  genomes_are_selected: function() {
    // where to put this so that the button initializes correctly?
    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init(elems, {direction: 'left', hoverEnabled: true});

    return Genomes.find({sequence: {$exists: true}}).fetch().length > 0;
    console.log('HELPER: genomes_are_selected');
    // /return Genomes.find({sequence: { $exists: true }}).fetch().length > 0;
  },
  clusters_expanded: function () {
    console.log('HELPER: clusters_expanded');
    return Session.get("clustersExpanded");
  },
  /*canRender() {
    return Session.get("canRender");
}*/
});
