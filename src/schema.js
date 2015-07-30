import {
  GraphQLObjectType,
  GraphQLSchema
} from 'graphql/type';

import {getTypes} from './type';
import {getArgs, getRootFields} from './query';

/**
 * @method getSchema
 * @param  {Array} models - mongoose models
 * @return {GraphQLSchema} schema
 */
function getSchema (models) {
  var types = getTypes(models);
  var queryArgs = getArgs(types, models);
  var queryFields = getRootFields(types, models, queryArgs);

  // Create root schema
  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootQueryType',
      fields: queryFields
    })
  });
}

export default {
  getSchema
};
