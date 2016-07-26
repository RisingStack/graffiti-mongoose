/**
 * Detailed explanation https://github.com/graphql/graphql-js/issues/312#issuecomment-196169994
 */

import {
 GraphQLScalarType,
 GraphQLInputObjectType,
 GraphQLEnumType,
 GraphQLID
} from 'graphql';
import { nodeInterface } from '../../schema/schema';

function filterFields(obj, filter) {
  return Object.keys(obj)
    .filter(filter)
    .reduce((result, key) => ({
      ...result,
      [key]: convertInputObjectField(obj[key]) // eslint-disable-line
    }), {});
}

const cachedTypes = {};
function createInputObject(type) {
  const typeName = `${type.name}Input`;

  if (!cachedTypes.hasOwnProperty(typeName)) {
    cachedTypes[typeName] = new GraphQLInputObjectType({
      name: typeName,
      fields: {}
    });
    cachedTypes[typeName]._typeConfig.fields =
      () => filterFields(type.getFields(), (field) => (!field.noInputObject)); // eslint-disable-line
  }

  return cachedTypes[typeName];
}

function convertInputObjectField(field) {
  let fieldType = field.type;
  const wrappers = [];

  while (fieldType.ofType) {
    wrappers.unshift(fieldType.constructor);
    fieldType = fieldType.ofType;
  }

  if (!(fieldType instanceof GraphQLInputObjectType ||
        fieldType instanceof GraphQLScalarType ||
        fieldType instanceof GraphQLEnumType)) {
    fieldType = fieldType.getInterfaces().includes(nodeInterface) ? GraphQLID : createInputObject(fieldType);
  }

  fieldType = wrappers.reduce((type, Wrapper) => new Wrapper(type), fieldType);

  return { type: fieldType };
}

export default createInputObject;
