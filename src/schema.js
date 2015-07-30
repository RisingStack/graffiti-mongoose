import {
  GraphQLObjectType,
  GraphQLSchema
} from 'graphql/type';

import type from './type';
import query from './query';

/**
 * @method get
 * @param  {Array} models - mongoose models
 * @return {GraphQLSchema} schema
 */
function get (models) {
  var types = type.get(models);
  var queryArgs = query.getArgs(types, models);
  var queryFields = query.getRootFields(types, models, queryArgs);

  // Create root schema
  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootQueryType',
      fields: queryFields
    })
  });
}

module.exports.get = get;
