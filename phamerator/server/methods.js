Meteor.methods({
  "userExists": function(username) {
    console.log('checking if user exists');
    return !!Meteor.users.findOne({
      username: username
    });
  },
  "updateSelectedData": function(phagename, addGenome) {
    console.log('updateSelectedData called with', phagename, addGenome);
    genomeMaps = Meteor.users.findOne({_id: Meteor.userId()}, {fields: {"selectedData.genomeMaps": 1}}).selectedData.genomeMaps;
    //console.log('genomeMaps:', genomeMaps);

    if (phagename === "") {
      //console.log('clearing selected data');
      Meteor.users.upsert({_id: Meteor.userId()},{ $set: {"selectedData.genomeMaps": []}});
    }

    else if (addGenome === true && genomeMaps.indexOf(phagename) === -1) {
      //console.log('adding:', phagename, 'to selectedData');
      genomeMaps.push(phagename);
      Meteor.users.upsert({_id: Meteor.userId()},{ $set: {"selectedData.genomeMaps": genomeMaps}});
    }
    else if (addGenome === false) {
      console.log("removing", phagename, "from selectedData");
      var index = genomeMaps.indexOf(phagename);
      if (index > -1) {
        genomeMaps.splice(index, 1);
        Meteor.users.upsert({_id: Meteor.userId()},{ $set: {"selectedData.genomeMaps": genomeMaps}});
      }
    }
  },
  sendVerificationLink() {
    console.log('sending verification email to ', Meteor.userId());
    let userId = Meteor.userId();
    if ( userId ) {
      return Accounts.sendVerificationEmail( userId );
    }
  },
  "getclusters": function () {
    if (typeof clusters !== "undefined") {
      console.log("sending precomputed clusters...");
      return clusters;
    }
    console.log("computing clusters...");
    clusters = [];

    // get an array of all unique cluster names
    clusterNames = _.uniq(Genomes.find({}, {sort: {cluster:1},
      fields: {cluster: true}, reactive: false
    }).fetch().map(function (x) {
      return x.cluster;
    }), false);
    //console.log("got cluster names");


    // for each cluster, get an array of unique subcluster names
    clusterNames.forEach(function (cluster, index, array) {
      //console.log(cluster);
      subClusterNames = _.uniq(Genomes.find({cluster: cluster}, {
        fields: {subcluster: true}, reactive: false
      }).fetch().map(function (x) {
        //return {'cluster': x.cluster, 'subcluster': x.subcluster, 'phagename': x.phagename};
        return x.subcluster;
      }), false);

      //console.log("got subclusters");
      subClusterNames.sort(function (a, b) {
        return a - b;
      });
      //console.log("sorted subclusters");
      subClusterNames.forEach(function (subcluster, index, array) {
        phageNames = Genomes.find({
          cluster: cluster,
          subcluster: subcluster
        }, {fields: {phagename: true}, reactive: false, sort: {phagename: 1}}).fetch().map(function (x) {
          return x.phagename
        });
        //console.log("got phage names");
        var singletonator = function () {
          if (cluster === "") {
            return {"name": "Singletons", "cluster": "", "subcluster": "", phageNames: phageNames}
          }
          else {
            return {"name": cluster + subcluster, "cluster": cluster, "subcluster": subcluster, phageNames: phageNames}
          }
        };
        singletonator();
        var singletonated = singletonator(this);
        clusters.push(singletonated);
      });
    });
    //console.log('clusters:', clusters);
    return clusters;
  }
});