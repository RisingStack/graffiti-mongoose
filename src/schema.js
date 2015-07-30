import {
  GraphQLObjectType,
  GraphQLSchema
} from 'graphql/type';

import {getTypes} from './type';
import {getRootFields} from './query';

/**
 * @method getSchema
 * @param  {Object} models - graffiti models
 * @return {GraphQLSchema} schema
 */
function getSchema (models) {
  var types = getTypes(models);
  var rootQueryFields = getRootFields(types, models);

  // Create root schema
  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootQueryType',
      fields: rootQueryFields
    })
  });
}

export default {
  getSchema
};
