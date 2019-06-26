Template.registerHelper('clusterIsChecked',function(cluster, subcluster) {
  // var worker = new Worker('/fib.js');
  // phagesInCluster = Genomes.find({cluster: cluster, subcluster: subcluster}, {fields: {"phagename": 1}}).fetch();
  //
  // worker.postMessage([cluster, subcluster, phagesInCluster, selectedGenomes]);
  // let r;
  // worker.addEventListener('message', function(e) {
  //   r = e.data
  //   console.log('e.data:', e.data);
  // }, false);
  // return r;


  //if (input === "Singletons") { input = ""; }
  phagesInCluster = Genomes.find({cluster: cluster, subcluster: subcluster}, {fields: {"phagename": 1}}).fetch();
  r = true;
  if (phagesInCluster.length == 0) {
    return false;
  }
  phagesInCluster.forEach(function (phage, phageIndex, myPhageArray) {
    if (selectedGenomes.find({"phagename": phage.phagename}).count() == 0) {
    // /if (Genomes.find({"phagename": phage.phagename, sequence: {$exists: true}}).count() == 0) {
      r = false;
    }
  });
  //console.log('clusterIsChecked(', cluster, subcluster, ')', r)
  return r;
});

Template.registerHelper('phageIsChecked',function(input){
  return selectedGenomes.find({"phagename": input}).count() > 0;
  //console.log('phageIsChecked(', input, ')')
  // /return Genomes.find({"phagename": input, sequence: {$exists: true}}).count() > 0;
});
