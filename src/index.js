import {graphql} from 'graphql';

import {getModels} from './model';
import schema from './schema';
import type from './type';

/**
 * Public interface for schemas
 * @method getSchema
 * @param {Array} mongooseModels
 * @return {Object} GraphQL schema
 */
function getSchema (mongooseModels) {
  var models = getModels(mongooseModels);
  return schema.getSchema(models);
}

/**
 * Public interface for types
 * @method getTypes
 * @param {Array} mongooseModels
 * @return {Object} GraphQL types
 */
function getTypes (mongooseModels) {
  var models = getModels(mongooseModels);
  return type.getTypes(models);
}

export {
  graphql,
  getSchema,
  getTypes
};
