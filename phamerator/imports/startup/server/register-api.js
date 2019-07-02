// GraphQL bug: make a change in this file and save it to reload
// GraphQL schema(s)

import { createApolloServer } from 'meteor/apollo';
import { makeExecutableSchema } from 'graphql-tools';
import merge from 'lodash/merge';

import ResolutionsSchema from '../../api/resolutions/Resolutions.graphql';
import ResolutionsResolvers from '../../api/resolutions/resolvers';

import GenomesSchema from '../../api/genomes/Genomes.graphql';
import GenomesResolvers from '../../api/genomes/resolvers';

import ClustersSchema from '../../api/clusters/Clusters.graphql';
import ClustersResolvers from '../../api/clusters/resolvers';

const testSchema = `
type Query {
  hi: String
  resolutions: [Resolution]
  genomes (
    dataset: String!
    phagename: String
    cluster: String
    subcluster: String
  ): [Genome]
  clusters (
    dataset: String!
    clusterSubcluster: String
    cluster: String
  ): [Cluster]
  cluster (
    dataset: String!
    clusterSubcluster: String!
  ): Cluster
  genome (phagename: String!): Genome
}
`;

const typeDefs = [
  testSchema,
  ResolutionsSchema,
  GenomesSchema,
  ClustersSchema
];

const resolver = {
  Query: {
    hi() {
      return "Hello Level Up";
    }
  }
};

const resolvers = merge(
  resolver, ResolutionsResolvers, GenomesResolvers, ClustersResolvers
)

console.log(typeDefs);
console.log(':(((())')

const logger = { log: e => console.log(e) }

const schema = makeExecutableSchema({
  typeDefs,
  logger,
  resolvers
});

createApolloServer({ schema });
