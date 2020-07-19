Template.domains.onCreated(function () {
  //Meteor.subscribe('genomes');
  console.log("domains template created");
  //Session.set("phameratorVersionNumber", Meteor.call("get_phamerator_version"), function(error, result) {
  //  return result;
  //});
});

Template.domains.onRendered(function () {
  $(document).ready(function () {
    $('.collapsible').collapsible({
      accordion: false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
    // M.updateTextFields();
    document.getElementById('domain_input').addEventListener('change', function (evt) {
      console.log(this.value);
      console.log(evt)
      // return
      //if (evt.key != 'Enter') return
      currentDataset = Session.get('currentDataset')
      Meteor.call('get_domains_by_query', this.value, currentDataset, function (error, domains) {
        console.log(error, domains)
        Session.set('searchedDomains', domains)
      })
    })

    $('.collapsible').collapsible({
      accordion: false, // A setting that changes the collapsible behavior to expandable instead of the default accordion style
      onOpen: function (el) {
        Session.set('genesByDomain', [])

        console.log(el[0].id, 'opened')
        Meteor.call('get_genes_by_domain', el[0].id, currentDataset, function (error, genes) {
          console.log(genes)
          Session.set('genesByDomain', genes)
        })
      }, // Callback for Collapsible open
      onClose: function (el) {
        // Callback for Collapsible close
      }
    });
  })
})

Template.domains.helpers({
  searchedDomains: function () {
    return Session.get('searchedDomains');
  },
  genes: function () {
    return Session.get('genesByDomain');
  },
  currentDataset: function () {
    return Session.get(currentDataset)
  }
});

/*Template.home.onRendered(function () {
   $(document).ready(function(){
    $('.collapsible').collapsible({
      accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
  });
});*/
