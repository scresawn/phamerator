var fib = function(cluster, subcluster, phagesInCluster, selectedGenomes) {
  console.log(cluster, subcluster)
  //phagesInCluster = Genomes.find({cluster: cluster, subcluster: subcluster}, {fields: {"phagename": 1}}).fetch();
  phagesInCluster.filter(phageName => {
    selectedGenome.filter(sg => sg.phagename === phageName)
  })

  console.log(typeof Genomes)
  if (phagesInCluster.length == 0) {
    return false;
  }
  phagesInCluster.forEach(function (phage, phageIndex, myPhageArray) {
    if (selectedGenomes.find({"phagename": phage.phagename}).count() == 0) {
    // /if (Genomes.find({"phagename": phage.phagename, sequence: {$exists: true}}).count() == 0) {
      return false;
    }
  });
  console.log('clusterIsChecked(', cluster, subcluster, ')')
  return true;
};

self.addEventListener('message', (function(e) {
  var n = e.data;
  //console.log("n:", n)
  var result = fib(n[0],n[1],n[2],n[3]);
  self.postMessage(result);
  self.close();
}), false);
