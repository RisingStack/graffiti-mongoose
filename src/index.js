import {graphql} from 'graphql';
import {getTypes} from './type';
import {getSchema} from './field';
import {getModels} from './model';

function _getTypes(mongooseModels) {
  const graffitiModels = getModels(mongooseModels);
  return getTypes(graffitiModels);
}

export default {
  graphql,
  getSchema,
  getTypes: _getTypes
};
