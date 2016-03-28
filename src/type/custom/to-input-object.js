/**
 * Detailed explanation https://github.com/graphql/graphql-js/issues/312#issuecomment-196169994
 */

import { nodeInterface } from '../../schema/schema';
import {
  GraphQLScalarType,
  GraphQLInputObjectType,
  GraphQLEnumType,
  GraphQLID
} from 'graphql';

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

function filterFields(obj, filter) {
  const result = {};
  Object.keys(obj).forEach((key) => {
    if (filter(obj[key])) {
      result[key] = convertInputObjectField(obj[key]); // eslint-disable-line no-use-before-define
    }
  });
  return result;
}

function convertInputObjectField(field) {
  let fieldType = field.type;
  const wrappers = [];

  while (fieldType.ofType) {
    wrappers.unshift(fieldType.constructor);
    fieldType = fieldType.ofType;
  }

  if (
    !(fieldType instanceof GraphQLInputObjectType ||
      fieldType instanceof GraphQLScalarType ||
      fieldType instanceof GraphQLEnumType
    )
  ) {
    fieldType = fieldType.getInterfaces().includes(nodeInterface)
      ? GraphQLID
      : createInputObject(fieldType);
  }

  fieldType = wrappers.reduce((type, Wrapper) => new Wrapper(type), fieldType);

  return { type: fieldType };
}

export default createInputObject;
