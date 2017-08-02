Meteor.methods({
  "userExists": function(username) {
    //console.log('checking if user exists');
    return !!Meteor.users.findOne({
      username: username
    });
  },
  "updateSelectedData": function(phagename, addGenome) {
    //console.log('updateSelectedData called with', phagename, addGenome);
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
      //console.log("removing", phagename, "from selectedData");
      var index = genomeMaps.indexOf(phagename);
      if (index > -1) {
        genomeMaps.splice(index, 1);
        Meteor.users.upsert({_id: Meteor.userId()},{ $set: {"selectedData.genomeMaps": genomeMaps}});
      }
    }
  },
  "updateSubclusterFavorites": function(subcluster, addFavorite) {
    //console.log('updateSubclusterFavorites called with', subcluster, addFavorite);

    // initialize selectedData.subclusterFavorites if it doesn't exist
    Meteor.users.update({_id: Meteor.userId(), 'selectedData.subclusterFavorites': {$exists : false}}, {$set: {'selectedData.subclusterFavorites': []}});
    favorites = Meteor.users.findOne({_id: Meteor.userId()}, {fields: {"selectedData.subclusterFavorites": 1}}).selectedData.subclusterFavorites;

    if (addFavorite === true && favorites.indexOf(subcluster) === -1) {
      favorites.push(subcluster);
      Meteor.users.upsert({_id: Meteor.userId()},{ $set: {"selectedData.subclusterFavorites": favorites}});
    }
    else if (addFavorite === false && favorites.indexOf(subcluster) !== -1) {
      var index = favorites.indexOf(subcluster);
      if (index > -1) {
        favorites.splice(index, 1);
        Meteor.users.upsert({_id: Meteor.userId()},{ $set: {"selectedData.subclusterFavorites": favorites}});
      }
    }
    //console.log('favorites:', favorites);
  },
  "updateFeatureDiscovery": function(featureName) {
    //console.log('updateFeatureDiscovery called with', featureName);

    // initialize selectedData.featureDiscovery if it doesn't exist
    Meteor.users.update({_id: Meteor.userId(), 'featureDiscovery': {$exists : false}}, {$set: {'featureDiscovery': []}});
    features = Meteor.users.findOne({_id: Meteor.userId()}, {fields: {"featureDiscovery": 1}}).featureDiscovery;
    //console.log("user has not yet dismissed", features);
    // if featureName not in features
    if (features.indexOf(featureName) === -1) {
      //console.log("feature has already been dismissed");
      return;
      //features.push(featureName);
      //Meteor.users.upsert({_id: Meteor.userId()},{ $set: {"selectedData.featureDiscovery": features}});
    }
    var index = features.indexOf(featureName);
    if (index > -1) {
      //console.log("dismissing", featureName, "from", features);
      features.splice(index, 1);
      Meteor.users.upsert({_id: Meteor.userId()},{ $set: {"featureDiscovery": features}});
    }
  },
  sendVerificationLink() {
    console.log('sending verification email to ', Meteor.userId());
    let userId = Meteor.userId();
    if ( userId ) {
      return Accounts.sendVerificationEmail( userId );
    }
  },

  "getphams": function () {
    if (typeof phams != "undefined") {
      //console.log("sending precomputed phams...");
      return phams;
    }
    //console.log("computing phams...");
    phamsObj = Phams.find().fetch().reduce(function (o, currentArray) {
      n = currentArray.name, v = currentArray.size;
      o[n] = v;
      return o
    }, {});
    return phamsObj;
  },

  "getclusters": function () {
    if (typeof clusters !== "undefined") {
      //console.log("sending precomputed clusters...");
      return clusters;
    }
    //console.log("computing clusters...");
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