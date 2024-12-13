Meteor.methods({
  "userExists": function (username) {
    return !!Meteor.users.findOne({
      username: username
    });
  },
  "addUserToRole": function (user, role, group) {
    Roles.addUsersToRoles(user, role, group);
    var key = "selectedData." + group;
    var projection = { key: { genomeMaps: [] } }
    Meteor.users.update({ _id: user }, { $set: projection })
  },
  "removeUserFromRole": function (user, role, group) {
    Roles.removeUsersFromRoles(user, role, group);
    Meteor.users.update({ _id: user }, { $set: { "preferredDataset": "" } })
  },
  "getDatasetsIView": function () {
    return Roles.getGroupsForUser(Meteor.userId(), "view")
  },
  "getDatasetsIOwn": function () {
    return Roles.getGroupsForUser(Meteor.userId(), "owner")
  },
  "updatePreferredDataset": function (dataset) {
    groups = Roles.getGroupsForUser(Meteor.userId(), "view")
    if (groups.includes(dataset)) {
      Meteor.users.upsert({ _id: Meteor.userId() }, { $set: { "preferredDataset": dataset } });
      return;
    }
  },

  "updateSelectedData": function (message, dataset, phagename, addGenome) {
    var fields = "selectedData." + dataset + ".genomeMaps"
    var set = {}
    selectedData = Meteor.users.findOne({ _id: Meteor.userId() }, { fields: { selectedData: 1 } }).selectedData;
    if (!selectedData[dataset]) {
      selectedData[dataset] = { genomeMaps: [] }
      Meteor.users.upsert({ _id: Meteor.userId() }, { $set: { selectedData: selectedData } });
    }
    genomeMaps = Meteor.users.findOne({ _id: Meteor.userId() }, { fields: { selectedData: 1 } }).selectedData[dataset].genomeMaps;

    if (phagename === "") {
      selectedData[dataset] = { genomeMaps: [] }
      Meteor.users.upsert({ _id: Meteor.userId() }, { $set: { selectedData: selectedData } });
    }

    else if (addGenome === true && genomeMaps.indexOf(phagename) === -1) {
      genomeMaps.push(phagename);
      selectedData[dataset] = { genomeMaps: genomeMaps }
      Meteor.users.upsert({ _id: Meteor.userId() }, { $set: { selectedData: selectedData } });
    }
    else if (addGenome === false) {
      var index = genomeMaps.indexOf(phagename);
      if (index > -1) {
        genomeMaps.splice(index, 1);
        selectedData[dataset] = { genomeMaps: genomeMaps }
        Meteor.users.upsert({ _id: Meteor.userId() }, { $set: { selectedData: selectedData } });
      }
    }
  },
  "updateSubclusterFavorites": function (dataset, subcluster, addFavorite) {

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
  },
  "updateFeatureDiscovery": function (featureName) {

    // initialize selectedData.featureDiscovery if it doesn't exist
    Meteor.users.update({ _id: Meteor.userId(), 'featureDiscovery': { $exists: false } }, { $set: { 'featureDiscovery': [] } });
    features = Meteor.users.findOne({ _id: Meteor.userId() }, { fields: { "featureDiscovery": 1 } }).featureDiscovery;

    // no features left to mark as seen by the user
    if (features.length === 0) {
      return;
    }
    features.shift();
    Meteor.users.upsert({ _id: Meteor.userId() }, { $set: { "featureDiscovery": features } });
  },
  "updateNewTermsAndPolicies": function () {

    // initialize selectedData.featureDiscovery if it doesn't exist
    Meteor.users.update({ _id: Meteor.userId() }, { $set: { 'newTermsAndPolicies': false } });
  },
  sendVerificationLink() {
    let userId = Meteor.userId();
    if (userId) {
      return Accounts.sendVerificationEmail(userId);
    }
  },

  "getphams": function (currentDataset) {
    if (!Roles.getGroupsForUser(Meteor.userId(), "view").includes(currentDataset)) {
      return [];
    }

    phamsObj = Phams.find({ dataset: currentDataset }).fetch().reduce(function (o, currentArray) {
      n = currentArray.PhamID, v = currentArray.size;
      o[n] = v;
      return o
    }, {});
    return phamsObj;
  },

  "get_clusters_by_pham": function (dataset, phamname) {

    selectedClusterMembers = []; //array of objects of form {cluster: "A1", phages: ['L5', 'D29', ...]}

    if (typeof phamname != null) {
      phamclusters = Genomes.find({
        dataset: dataset, genes: {
          $elemMatch: {
            phamName: { $eq: phamname }
          }
        }
      }, { sort: { cluster: 1, subcluster: 1 }, fields: { _id: false, phagename: 1, cluster: 1, subcluster: 1 } }).fetch().map(function (x) {
        if (x.cluster === "") {
          x.cluster = "Singletons"
          x.subcluster = ""
        }
        if (x.cluster === "Singletons") {
          var thiscluster = selectedClusterMembers.find(y => y.cluster === "Singletons"); // find singletons
        }
        else {
          var thiscluster = selectedClusterMembers.find(y => y.cluster === (x.cluster + x.subcluster));
        }

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
      });
      return selectedClusterMembers;
    }
    else {
    }
  },

  "get_genes_by_domain": function (domainID, dataset) {
    return Domains.find({ dataset: dataset, DomainID: domainID }).fetch()
  },

  "get_tRNAs_by_phage": function (PhageID, dataset) {
    let tRNAs = TRNAs.find({ dataset: dataset, PhageID: PhageID }).fetch()
    return tRNAs;
  },

  "get_all_domains_by_query": function (domainDescription, dataset) {
    return Domains.find({ description: new RegExp(domainDescription), dataset: dataset }, { sort: { geneID: 1 } }).fetch()
  },

  "get_domains_by_query": function (domainDescription, dataset) {

    result = {} // each key a domainID, each value an array of matches to the domainID
    // get all the DomainIDs whose description matches the query
    domains = Domains.rawCollection().distinct('DomainID', { description: new RegExp(domainDescription), dataset: dataset }).then(
      (domainIDs) => {
        return domainIDs.map((domainID) => {
          d = Domains.findOne({ DomainID: domainID, dataset: dataset }, { domainID: true, description: true })
          return d
        })
        return domainIDs
      }
    ).then((domains) => {
      return domains;

    })
    return domains
  },

  "get_domains_by_gene": function (geneID, dataset) {
    domains = Domains.find({ geneID: geneID, dataset: dataset }).fetch();
    domains.forEach(function (d) {
      d.domainLink = "https://www.ncbi.nlm.nih.gov/Structure/cdd/cddsrv.cgi?uid=" + d.DomainID;
    })
    return domains;
  },

  "get_tm_domains_by_gene": function (geneID, dataset) {
    tmdomains = TMDomains.find({ geneID: geneID, dataset: dataset }).fetch();
    return tmdomains;
  },

  "getlargestphamsize": function () {
    return Phams.findOne({}, { sort: { size: -1 } }).size;
  },

  "get_number_of_domains": function (geneID, dataset) {
    domainsCount = Domains.find({ geneID: geneID, dataset: dataset }).count();
    return { "geneID": geneID, "domainsCount": domainsCount };
  },

  "get_number_of_genomes": function () {
    const genomeCount = Genomes.find({ dataset: "Actino_Draft" }).count();
    console.log("get_number_of_genomes", genomeCount);
    return genomeCount;
  },

  "getclusters": function (currentDataset) {

    if (!Roles.getGroupsForUser(Meteor.userId(), "view").includes(currentDataset)) {
      return [];
    }

    clusters = [];

    clusterNames = _.uniq(Genomes.find({ "dataset": currentDataset }, {
      fields: { cluster: true }, reactive: false
    }).fetch().map(function (x) {
      return x.cluster;
    }), false);
    clusterNames.sort();

    // for each cluster, get an array of unique subcluster names
    clusterNames.forEach(function (cluster, index, array) {
      subClusterNames = _.uniq(Genomes.find({ "dataset": currentDataset, "cluster": cluster }, {
        fields: { subcluster: true }, reactive: false
      }).fetch().map(function (x) {
        return x.subcluster;
      }), false);

      subClusterNames.sort(function (a, b) {
        return a - b;
      });
      subClusterNames.forEach(function (subcluster, index, array) {
        phageNames = Genomes.find({
          dataset: currentDataset,
          cluster: cluster,
          subcluster: subcluster
        }, { fields: { phagename: true }, reactive: false }).fetch().map(function (x) {
          return x.phagename
        });
        phageNames.sort();
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
    return clusters;
  }
});
