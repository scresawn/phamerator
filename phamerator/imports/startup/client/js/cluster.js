Template.cluster.onRendered(function () {
  $('.collapsible').collapsible({
    accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
  });

  $('li').find('.dont-collapse').unbind('click.collapse');
  $('li').find('.dont-collapse').on('click.collapse', function(e) {
    e.stopPropagation();
    console.log("suppressing collapse");
    $(e.target).trigger('favorites-click');
  });
});

Template.cluster.helpers({
  selectedCount: function (cluster, subcluster) {
    //console.log('HELPER: selectedCount');
    count = selectedGenomes.find({cluster: cluster, subcluster:subcluster}).count();
    // /count = Genomes.find({cluster: cluster, subcluster:subcluster, sequence: {$exists: true}}).count();
    //console.log('selectedCount() done')
    if ( count === 0) {
      return "";
    }
    return count;
  },
  selectedClass: function(cluster, subcluster) {
    //console.log('HELPER: selectedClass');
    count = selectedGenomes.find({cluster: cluster, subcluster:subcluster}).count();
    // /count = Genomes.find({cluster: cluster, subcluster:subcluster, sequence: {$exists: true}}).count();
    if ( count === 0) {
      return "badge";
    }
    //console.log('selectedClass() done')
    return "purple new badge";
  },
  dataBadgeCaption: function(cluster, subcluster) {
    //console.log('HELPER: dataBadgeCaption');
    count = selectedGenomes.find({cluster: cluster, subcluster:subcluster}).count();
    // /count = Genomes.find({cluster: cluster, subcluster:subcluster, sequence: {$exists: true}}).count();
    if ( count === 0) {
      return "";
    }
    else if ( count === 1) {
      console.log('dataBadgeCaption() done')
      return "selected genome";
    }
    console.log('dataBadgeCaption() done')
    return "selected genomes";
  },
  favoriteSubcluster: function(cluster, subcluster) {
    //console.log('HELPER: favoriteSubcluster');
    //console.log(Meteor.user().selectedData.subclusterFavorites);
    if (Meteor.user() && Meteor.user().selectedData && Meteor.user().selectedData[Session.get('currentDataset')] && Meteor.user().selectedData[Session.get('currentDataset')].subclusterFavorites) {
      var favs = Meteor.user().selectedData[Session.get('currentDataset')].subclusterFavorites;
      //console.log(cluster + subcluster, favs);
      if (cluster === "") {
        if (favs.indexOf("favorite-Singletons") < 0) {
          //console.log('favoriteSubcluster() done')
          return "grey-text";
        }
      }
      else if (favs.indexOf("favorite-" + cluster + subcluster) < 0) {
        //console.log('favoriteSubcluster() done')
        return "grey-text";
      }
      //console.log('favoriteSubcluster() done')
      return "yellow-text favorite";
    }
  }
});
