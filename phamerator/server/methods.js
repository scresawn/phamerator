Meteor.methods({
  "userExists": function (username) {
    //console.log('checking if user exists');
    return !!Meteor.users.findOne({
      username: username
    });
  },
  "addUserToRole": function (user, role, group) {
    console.log("adding", user, "(", role, ") to", group);
    Roles.addUsersToRoles(user, role, group);
    var key = "selectedData." + group;
    var projection = { key: { genomeMaps: [] } }
    Meteor.users.update({ _id: user }, { $set: projection })
  },
  "removeUserFromRole": function (user, role, group) {
    console.log("removing", user, "(", role, ") from", group);
    Roles.removeUsersFromRoles(user, role, group);
    Meteor.users.update({ _id: user }, { $set: { "preferredDataset": "" } })
  },
  "getDatasetsIView": function () {
    console.log("getDatasetsIView()", Roles.getGroupsForUser(Meteor.userId(), "view"))
    return Roles.getGroupsForUser(Meteor.userId(), "view")
  },
  "getDatasetsIOwn": function () {
    return Roles.getGroupsForUser(Meteor.userId(), "owner")
  },
  "updatePreferredDataset": function (dataset) {
    groups = Roles.getGroupsForUser(Meteor.userId(), "view")
    if (groups.includes(dataset)) {
      console.log("updating preferredDataset to ", dataset)
      Meteor.users.upsert({ _id: Meteor.userId() }, { $set: { "preferredDataset": dataset } });
      return;
    }
  },

  "updateSelectedData": function (message, dataset, phagename, addGenome) {
    console.log('updateSelectedData called:', message, dataset, phagename, addGenome);
    //console.log(Meteor.users.findOne({_id: Meteor.userId()}, {fields: {selectedData: 1}}))
    var fields = "selectedData." + dataset + ".genomeMaps"
    var set = {}
    selectedData = Meteor.users.findOne({ _id: Meteor.userId() }, { fields: { selectedData: 1 } }).selectedData;
    if (!selectedData[dataset]) {
      selectedData[dataset] = { genomeMaps: [] }
      console.log("first use of dataset", dataset);
      Meteor.users.upsert({ _id: Meteor.userId() }, { $set: { selectedData: selectedData } });
    }
    genomeMaps = Meteor.users.findOne({ _id: Meteor.userId() }, { fields: { selectedData: 1 } }).selectedData[dataset].genomeMaps;
    //console.log('genomeMaps:', genomeMaps);

    if (phagename === "") {
      //console.log('clearing selected data');
      selectedData[dataset] = { genomeMaps: [] }
      Meteor.users.upsert({ _id: Meteor.userId() }, { $set: { selectedData: selectedData } });
    }

    else if (addGenome === true && genomeMaps.indexOf(phagename) === -1) {
      //console.log('adding:', phagename, 'to selectedData');
      genomeMaps.push(phagename);
      selectedData[dataset] = { genomeMaps: genomeMaps }
      Meteor.users.upsert({ _id: Meteor.userId() }, { $set: { selectedData: selectedData } });
    }
    else if (addGenome === false) {
      //console.log("removing", phagename, "from selectedData");
      var index = genomeMaps.indexOf(phagename);
      if (index > -1) {
        genomeMaps.splice(index, 1);
        selectedData[dataset] = { genomeMaps: genomeMaps }
        Meteor.users.upsert({ _id: Meteor.userId() }, { $set: { selectedData: selectedData } });
      }
    }
  },
  "updateSubclusterFavorites": function (dataset, subcluster, addFavorite) {
    //console.log('updateSubclusterFavorites called with', subcluster, addFavorite);

    // initialize selectedData.subclusterFavorites if it doesn't exist
    Meteor.users.update({ _id: Meteor.userId(), 'selectedData.dataset.subclusterFavorites': { $exists: false } }, { $set: { 'selectedData.dataset.subclusterFavorites': [] } });
    favorites = Meteor.users.findOne({ _id: Meteor.userId() }, { fields: { "selectedData.dataset.subclusterFavorites": 1 } }).selectedData.dataset.subclusterFavorites;

    if (addFavorite === true && favorites.indexOf(subcluster) === -1) {
      favorites.push(subcluster);
      Meteor.users.upsert({ _id: Meteor.userId() }, { $set: { "selectedData.dataset.subclusterFavorites": favorites } });
    }
    else if (addFavorite === false && favorites.indexOf(subcluster) !== -1) {
      var index = favorites.indexOf(subcluster);
      if (index > -1) {
        favorites.splice(index, 1);
        Meteor.users.upsert({ _id: Meteor.userId() }, { $set: { "selectedData.dataset.subclusterFavorites": favorites } });
      }
    }
    //console.log('favorites:', favorites);
  },
  "updateFeatureDiscovery": function (featureName) {
    //console.log('updateFeatureDiscovery called with', featureName);

    // initialize selectedData.featureDiscovery if it doesn't exist
    Meteor.users.update({ _id: Meteor.userId(), 'featureDiscovery': { $exists: false } }, { $set: { 'featureDiscovery': [] } });
    features = Meteor.users.findOne({ _id: Meteor.userId() }, { fields: { "featureDiscovery": 1 } }).featureDiscovery;
    //console.log("user has not yet dismissed", features);

    // no features left to mark as seen by the user
    if (features.length === 0) {
      return;
    }
    features.shift();
    Meteor.users.upsert({ _id: Meteor.userId() }, { $set: { "featureDiscovery": features } });

    /*var index = features.indexOf(featureName);
    if (index > -1) {
      //console.log("dismissing", featureName, "from", features);
      features.splice(index, 1);
      Meteor.users.upsert({_id: Meteor.userId()},{ $set: {"featureDiscovery": features}});
    }*/
  },
  "updateNewTermsAndPolicies": function () {

    // initialize selectedData.featureDiscovery if it doesn't exist
    Meteor.users.update({ _id: Meteor.userId() }, { $set: { 'newTermsAndPolicies': false } });
  },
  sendVerificationLink() {
    console.log('sending verification email to ', Meteor.userId());
    let userId = Meteor.userId();
    if (userId) {
      return Accounts.sendVerificationEmail(userId);
    }
  },

  "getphams": function (currentDataset) {
    console.log("calling getphams()...");
    if (!Roles.getGroupsForUser(Meteor.userId(), "view").includes(currentDataset)) {
      return [];
    }
    /*
    // pham cache is now called phamsObj, but needs to be specific for 'currentDataset'
    if (typeof phams != "undefined") {
      console.log("sending precomputed phams...");
      return phams;
    }*/
    console.log("computing phams...");
    phamsObj = Phams.find({ dataset: currentDataset }).fetch().reduce(function (o, currentArray) {
      n = currentArray.name, v = currentArray.size;
      o[n] = v;
      return o
    }, {});
    console.log("returning newly computed phams...");
    return phamsObj;
  },

  "get_clusters_by_pham": function (dataset, phamname) {
    //console.log("calling get_clusters_by_pham(", phamname, ")");

    selectedClusterMembers = []; //array of objects of form {cluster: "A1", phages: ['L5', 'D29', ...]}

    if (typeof phamname != null) {
      phamclusters = Genomes.find({
        dataset: dataset, genes: {
          $elemMatch: {
            phamName: { $eq: phamname }
          }
        }
      }, { sort: { cluster: 1, subcluster: 1 }, fields: { _id: false, phagename: 1, cluster: 1, subcluster: 1 } }).fetch().map(function (x) {
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

  "get_genes_by_domain": function (domainID, dataset) {
    console.log("get_genes_by_domain: ", domainID);
    return Domains.find({ dataset: dataset, DomainID: domainID }).fetch()
  },

  "get_domains_by_query": function (domainDescription, dataset) {
    console.log("get_domains_by_query: ", domainDescription);
    //var regex = new RegExp(domainDescription, 'g');
    //string.match(regex);
    // if (domainDescription.length < 4) {
    //   console.log('query too short')
    //   return []
    // }
    // genes = Domains.find({ description: new RegExp(domainDescription), dataset: dataset }).fetch()

    result = {} // each key a domainID, each value an array of matches to the domainID
    // get all the DomainIDs whose description matches the query
    domains = Domains.rawCollection().distinct('DomainID', { description: new RegExp(domainDescription), dataset: dataset }).then(
      (domainIDs) => {
        return domainIDs.map((domainID) => {
          console.log(domainID);
          d = Domains.findOne({ DomainID: domainID, dataset: dataset }, { domainID: true, description: true })
          console.log(d)
          return d
        })
        //console.log('domainIDs', domainIDs)
        //genes = []

        // for each domainID, find every gene that has it
        // domains = domainIDs.map((domainID) => {
        //   console.log('Domains.find(' + domainID + ')')
        //   matches = Domains.find({ dataset: dataset, DomainID: domainID }).fetch()
        //   result[domainID] = matches
        //   return matches //don't really need to return anything? // an array of gene objects with this domain
        // })
        // return result
        return domainIDs
      }
    ).then((domains) => {
      console.log('done with domain search!')
      console.log('domains:', domains)
      return domains;

    })
    return domains
  },

  "get_domains_by_gene": function (geneID, dataset) {
    //console.log("get_domains_by_gene: ", geneID);
    domains = Domains.find({ geneID: geneID, dataset: dataset }).fetch();
    domains.forEach(function (d) {
      d.domainLink = "https://www.ncbi.nlm.nih.gov/Structure/cdd/cddsrv.cgi?uid=" + d.DomainID;
      //console.log(d);
    })
    //console.log (domains);
    return domains;

  },
  "getlargestphamsize": function () {
    return Phams.findOne({}, { sort: { size: -1 } }).size;
  },

  "get_number_of_domains": function (geneID, dataset) {
    //console.log(geneID);
    domainsCount = Domains.find({ geneID: geneID, dataset: dataset }).count();
    //console.log(domainsCount);
    return { "geneID": geneID, "domainsCount": domainsCount };
  },

  "getclusters": function (currentDataset) {
    console.log("getting clusters for", currentDataset);
    console.log("getting groups for", Meteor.userId(), Roles.getGroupsForUser(Meteor.userId(), "view"));
    if (!Roles.getGroupsForUser(Meteor.userId(), "view").includes(currentDataset)) {
      return [];
    }
    //if (typeof clusters !== "undefined") {
    //  console.log("sending precomputed clusters...");
    //  return clusters;
    //}
    console.log("computing clusters...");
    clusters = [];

    // get an array of all unique cluster names
    /*clusterNames = _.uniq(Genomes.find({"dataset": currentDataset}, {sort: {cluster:1},
      fields: {cluster: true}, reactive: false
    }).fetch().map(function (x) {
      return x.cluster;
    }), false);*/
    clusterNames = _.uniq(Genomes.find({ "dataset": currentDataset }, {
      fields: { cluster: true }, reactive: false
    }).fetch().map(function (x) {
      return x.cluster;
    }), false);
    //console.log("clusterNames", clusterNames)
    clusterNames.sort();
    //console.log("got cluster names");

    // for each cluster, get an array of unique subcluster names
    clusterNames.forEach(function (cluster, index, array) {
      //console.log(cluster);
      subClusterNames = _.uniq(Genomes.find({ "dataset": currentDataset, "cluster": cluster }, {
        fields: { subcluster: true }, reactive: false
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
          dataset: currentDataset,
          cluster: cluster,
          subcluster: subcluster
        }, { fields: { phagename: true }, reactive: false }).fetch().map(function (x) {
          return x.phagename
        });
        phageNames.sort();
        //console.log("got phage names");
        var singletonator = function () {
          if (cluster === "") {
            return { "name": "Singletons", "cluster": "", "subcluster": "", phageNames: phageNames }
          }
          else {
            return { "name": cluster + subcluster, "cluster": cluster, "subcluster": subcluster, phageNames: phageNames }
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
