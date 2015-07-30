import {graphql} from 'graphql';
import schema from './schema';
import type from './type';

export default {
  graphql,
  getSchema: schema.get,
  getTypes: type.get
};

