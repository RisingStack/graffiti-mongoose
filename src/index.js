import {graphql} from 'graphql';
import schema from './schema';
import type from './type';

module.exports.graphql = graphql;

module.exports.getSchema = schema.get;
module.exports.getTypes = type.get;
