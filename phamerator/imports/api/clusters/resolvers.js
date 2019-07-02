import Clusters from './clusters';
import Genomes from '../genomes/genomes';

export default  {
  Query: {
    /*clusters (obj, args, context) {
      return Clusters.find(args).fetch();
    },
    cluster (obj, args, context) {
      let c = Clusters.find(args).fetch()[0]
      let phages = c.phages;
      c.phages = phages.map((phagename) => { return Genomes.find({phagename: phagename, dataset: args.dataset}).fetch()[0] })
      return c;
    }*/
    clusters (obj, args, context) {
      let clusterObjs = Clusters.find(args).fetch()
      console.log(args.phages)
      //if (args.phages != undefined) {
        clusterObjs.map((c) => {
          let phages = c.phages;
          c.phages = phages.map((phagename) => { return Genomes.find({phagename: phagename, dataset: args.dataset}).fetch()[0] })
          return c;
        })
      //}
      return clusterObjs;
    }
  }
};
