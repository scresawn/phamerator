import Genomes from './genomes';

export default  {
  Query: {
    genomes (obj, args, context) {
      console.log(args)
      query = {}
      //console.log(parent, args, context, info)
      //console.log($phagename)
      //console.log (obj, name, context)

      // uncomment to sort
      //return Genomes.find(args, {sort: {"phagename": 1}}).fetch();
      return Genomes.find(args).fetch();
    }
  }
};
