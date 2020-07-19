Template.domains.onCreated(function () {
  //Meteor.subscribe('genomes');
  console.log("domains template created");
  //Session.set("phameratorVersionNumber", Meteor.call("get_phamerator_version"), function(error, result) {
  //  return result;
  //});
});



Template.domains.onRendered(function () {
  $(document).ready(function () {
    // $('.collapsible').collapsible({
    //   accordion: false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    // });
    document.getElementById('domain_input').addEventListener('change', function (evt) {
      let query = this.value
      $("#preloader").show(function () {

        console.log(query);
        console.log(evt)
        Session.set('domainQuery', query)
        currentDataset = Session.get('currentDataset')

        if (query == null || query.trim() == "") {
          Session.set('domainMatches', []);
          $("#preloader").fadeOut(300).hide()

        }
        else {
          Meteor.call('get_all_domains_by_query', query, currentDataset, function (error, matches) {
            console.log(query, currentDataset)
            Session.set('domainMatches', matches);
            $("#preloader").fadeOut(300).hide()

          })
        }
      })

      // Meteor.call('get_domains_by_query', this.value, currentDataset, function (error, domains) {
      //   console.log(error, domains)
      //   searchedDomains = domains;
      //   //Session.set('searchedDomains', domains)
      // })

      // matches = [];

      // searchedDomains.forEach(domain => {
      //   Meteor.call('get_genes_by_domain', domain, currentDataset, function (error, genes) {
      //     console.log(genes)
      //     matches.concat(genes);
      //     //Session.set('genesByDomain', genes)
      //   })

      // });
      // Session.set('domainMatches', matches);
    })



    // document.getElementById('domain_input').addEventListener('change', function (evt) {
    //   console.log(this.value);
    //   console.log(evt)
    //   // return
    //   //if (evt.key != 'Enter') return
    //   currentDataset = Session.get('currentDataset')
    //   Meteor.call('get_domains_by_query', this.value, currentDataset, function (error, domains) {
    //     console.log(error, domains)
    //     Session.set('searchedDomains', domains)
    //   })
    // })

    // $('.collapsible').collapsible({
    //   accordion: false, // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    //   onOpen: function (el) {
    //     Session.set('genesByDomain', [])

    //     console.log(el[0].id, 'opened')
    //     Meteor.call('get_genes_by_domain', el[0].id, currentDataset, function (error, genes) {
    //       console.log(genes)
    //       Session.set('genesByDomain', genes)
    //     })
    //   }, // Callback for Collapsible open
    //   onClose: function (el) {
    //     // Callback for Collapsible close
    //   }
    // });
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
  },
  domainMatches: function () {
    return Session.get('domainMatches')
  },
  domainQuery: function () {
    return Session.get('domainQuery')
  }


});

/*Template.home.onRendered(function () {
   $(document).ready(function(){
    $('.collapsible').collapsible({
      accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
  });
});*/
