import {graphql} from 'graphql';
import {getTypes} from './type';
import {getSchema} from './field';
import {getModels} from './model';

function _getTypes(collections) {
  const graffitiModels = getModels(collections);
  return getTypes(graffitiModels);
}

export default {
  graphql,
  getSchema,
  getTypes: _getTypes
};
