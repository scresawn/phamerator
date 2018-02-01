Meteor.methods({
  "userExists": function(username) {
    //console.log('checking if user exists');
    return !!Meteor.users.findOne({
      username: username
    });
  },
  "get_phamerator_version": function () {
    return "uhhhh";
    //return PhameratorVersionCollection.findOne();
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

    // no features left to mark as seen by the user
    if (features.length === 0) {
      return;
    }
    features.shift();
    Meteor.users.upsert({_id: Meteor.userId()},{ $set: {"featureDiscovery": features}});

    /*var index = features.indexOf(featureName);
    if (index > -1) {
      //console.log("dismissing", featureName, "from", features);
      features.splice(index, 1);
      Meteor.users.upsert({_id: Meteor.userId()},{ $set: {"featureDiscovery": features}});
    }*/
  },
  "updateNewTermsAndPolicies": function() {

    // initialize selectedData.featureDiscovery if it doesn't exist
    Meteor.users.update({_id: Meteor.userId()}, {$set: {'newTermsAndPolicies': false}});
  },
  sendVerificationLink() {
    console.log('sending verification email to ', Meteor.userId());
    let userId = Meteor.userId();
    if ( userId ) {
      return Accounts.sendVerificationEmail( userId );
    }
  },

  "getphams": function () {
    console.log("calling getphams()...");
    if (typeof phams != "undefined") {
      console.log("sending precomputed phams...");
      return phams;
    }
    console.log("computing phams...");
    phamsObj = Phams.find().fetch().reduce(function (o, currentArray) {
      n = currentArray.name, v = currentArray.size;
      o[n] = v;
      return o
    }, {});
    console.log("returning newly computed phams...");
    return phamsObj;
  },


  "get_clusters_by_pham": function (phamname) {
    //console.log("calling get_clusters_by_pham(", phamname, ")");

    selectedClusterMembers = []; //array of objects of form {cluster: "A1", phages: ['L5', 'D29', ...]}

    if (typeof phamname != null) {
      phamclusters = Genomes.find({ genes: { $elemMatch : {
        phamName: { $eq: phamname }
      }}
      }, {sort: {cluster:1, subcluster: 1} , fields: {_id: false, phagename:1, cluster: 1, subcluster: 1}}).fetch().map(function (x) {
        //console.log("x:", x);
        //console.log("x.cluster + x.subcluster:", x.cluster + x.subcluster);
        if (x.cluster === "") {
          return x.phagename;
        }
        //console.log("selectedClusterMembers.hasOwnProperty(x.cluster + x.subcluster):", selectedClusterMembers.hasOwnProperty(x.cluster + x.subcluster));


        //if (selectedClusterMembers.hasOwnProperty(x.cluster + x.subcluster) === false) {
        var thiscluster = selectedClusterMembers.find(y => y.cluster === (x.cluster + x.subcluster));
        if (thiscluster == undefined) {
          thiscluster = {};
          thiscluster.cluster = x.cluster + x.subcluster;
          thiscluster.phages = [];
          thiscluster.phages.push(x.phagename);
          thiscluster.phages.sort();
          selectedClusterMembers.push(thiscluster);
        }
        else {
          thiscluster.phages.push(x.phagename);
          thiscluster.phages.sort();
          selectedClusterMembers[selectedClusterMembers.indexOf(thiscluster)] = thiscluster;
        }
      //console.log("index:", selectedClusterMembers.indexOf(thiscluster));

      });
      //console.log("selectedClusterMembers:", selectedClusterMembers);
      return selectedClusterMembers;
      //return phamclusters;
      //uniqueClusters = _.uniq(phamclusters);
      //console.log(uniqueClusters);
      //return uniqueClusters;
    }
    else {
      console.log("ERROR: no pham name was given to get_clusters_by_pham...");
    }
  },

  "get_domains_by_gene":function (geneID) {
    //console.log("get_domains_by_gene: ", geneID);
    domains = Domains.find({geneID:geneID}).fetch();
    domains.forEach(function (d) {
      d.domainLink = "https://www.ncbi.nlm.nih.gov/Structure/cdd/cddsrv.cgi?uid=" + d.DomainID;
      //console.log(d);
    })
    //console.log (domains);
    return domains;

  },
    "getlargestphamsize": function () {
        return Phams.findOne({},{sort:{size: -1}}).size;
    },

    "get_number_of_domains" :function  (geneID) {
        //console.log(geneID);
        domainsCount = Domains.find({geneID: geneID}).count();
        //console.log(domainsCount);
        return {"geneID": geneID, "domainsCount": domainsCount};
    },
  /*"getlargestphamsize": function() {
    //nobiggie = Phams.find().sort({size: -1}).limit(1);
    //nobiggie = nobiggie.size;
    nobiggie = Phams.findOne({}, {sort: {size:-1}});
    console.log(nobiggie.size);
    return nobiggie;
  },*/

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
