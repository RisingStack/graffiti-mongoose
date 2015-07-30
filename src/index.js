import {graphql} from 'graphql';

import {getModels} from './model';
import {getSchema} from './schema';
import {getTypes} from './type';

module.exports.getSchema = function (mongooseModels) {
  var models = getModels(mongooseModels);
  return getSchema(models);
};

module.exports.getTypes = function (mongooseModels) {
  var models = getModels(mongooseModels);
  return getTypes(models);
};

module.exports.graphql = graphql;
