import {
  reduce,
  forEach,
  isFunction
} from 'lodash';
import {
  globalIdField,
  connectionArgs,
  connectionDefinitions,
  nodeDefinitions
} from 'graphql-relay';
import {
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLEnumType
} from 'graphql/type';
import { addHooks } from '../utils';
import GraphQLDate from './custom/date';
import GraphQLBuffer from './custom/buffer';
import GraphQLGeneric from './custom/generic';
import { connectionFromModel, getOneResolver } from '../query';

// Registered types will be saved, we can access them later to resolve types
const types = [];

/**
 * Add new type
 * @param {String} name
 * @param {GraphQLType} type
 */
function addType(name, type) {
  types[name] = type;
}

// Node interface
const { nodeInterface } = nodeDefinitions(null, (obj) => (
  // Type resolver
  obj._type ? types[obj._type] : null
));

// GraphQL Viewer type
const GraphQLViewer = new GraphQLObjectType({
  name: 'Viewer',
  interfaces: [nodeInterface]
});

// Register Viewer type
addType('Viewer', GraphQLViewer);

/**
 * Returns a GraphQL type based on a String representation
 * @param  {String} type
 * @return {GraphQLType}
 */
function stringToGraphQLType(type) {
  switch (type) {
    case 'String':
      return GraphQLString;
    case 'Number':
      return GraphQLFloat;
    case 'Date':
      return GraphQLDate;
    case 'Buffer':
      return GraphQLBuffer;
    case 'Boolean':
      return GraphQLBoolean;
    case 'ObjectID':
      return GraphQLID;
    default:
      return GraphQLGeneric;
  }
}

/**
 * Returns a GraphQL Enum type based on a List of Strings
 * @param  {Array} list
 * @param  {String} name
 * @return {Object}
 */
function listToGraphQLEnumType(list, name) {
  const values = reduce(list, (values, val) => {
    values[val] = { value: val };
    return values;
  }, {});
  return new GraphQLEnumType({ name, values });
}

/**
 * Extracts the fields of a GraphQL type
 * @param  {GraphQLType} type
 * @return {Object}
 */
function getTypeFields(type) {
  const fields = type._typeConfig.fields;
  return isFunction(fields) ? fields() : fields;
}

/**
 * Assign fields to a GraphQL type
 * @param {GraphQLType} type
 * @param {Object} fields
 */
function setTypeFields(type, fields) {
  type._typeConfig.fields = () => fields;
}

const orderByTypes = {};
/**
 * Returns order by GraphQLEnumType for fields
 * @param  {{String}} {name}
 * @param  {Object} fields
 * @return {GraphQLEnumType}
 */
function getOrderByType({ name }, fields) {
  if (!orderByTypes[name]) {
    // save new enum
    orderByTypes[name] = new GraphQLEnumType({
      name: `orderBy${name}`,
      values: reduce(fields, (values, field) => {
        if (field.type instanceof GraphQLScalarType) {
          const upperCaseName = field.name.toUpperCase();
          values[`${upperCaseName}_ASC`] = {
            name: `${upperCaseName}_ASC`,
            value: {
              [field.name]: 1
            }
          };
          values[`${upperCaseName}_DESC`] = {
            name: `${upperCaseName}_DESC`,
            value: {
              [field.name]: -1
            }
          };
        }

        return values;
      }, {})
    });
  }
  return orderByTypes[name];
}

/**
 * Returns query arguments for a GraphQL type
 * @param  {GraphQLType} type
 * @param  {Object} args
 * @return {Object}
 */
function getArguments(type, args = {}) {
  const fields = getTypeFields(type);

  return reduce(fields, (args, field) => {
    // Extract non null fields, those are not required in the arguments
    if (field.type instanceof GraphQLNonNull && field.name !== 'id') {
      field.type = field.type.ofType;
    }

    if (field.type instanceof GraphQLScalarType) {
      args[field.name] = field;
    }

    return args;
  }, {
    ...args,
    orderBy: {
      name: 'orderBy',
      type: getOrderByType(type, fields)
    }
  });
}

/**
 * Returns a concatenation of type and field name, used for nestedObjects
 * @param {String} typeName
 * @param {String} fieldName
 * @returns {String}
 */
function getTypeFieldName(typeName, fieldName) {
  const fieldNameCapitalized = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  return `${typeName}${fieldNameCapitalized}`;
}

// Holds references to fields that later have to be resolved
const resolveReference = {};

/**
 * Returns GraphQLType for a graffiti model
 * @param  {Object} graffitiModels
 * @param  {{String, String, Object}} {name, description, fields}
 * @param  {Boolean} root
 * @return {GraphQLObjectType}
 */
function getType(graffitiModels, { name, description, fields }, path = [], rootType = null) {
  const root = path.length === 0;
  const graphQLType = { name, description };
  rootType = rootType || graphQLType;

  // These references have to be resolved when all type definitions are avaiable
  resolveReference[graphQLType.name] = resolveReference[graphQLType.name] || {};
  const graphQLTypeFields = reduce(fields, (graphQLFields,
      { name, description, type, subtype, reference, nonNull, hidden, hooks,
       fields: subfields, embeddedModel, enumValues }, key) => {
    name = name || key;
    const newPath = [...path, name];

    // Don't add hidden fields to the GraphQLObjectType
    if (hidden || name.startsWith('__')) {
      return graphQLFields;
    }

    const graphQLField = { name, description };

    if (type === 'Array') {
      if (subtype === 'Object') {
        const fields = subfields;
        const nestedObjectName = getTypeFieldName(graphQLType.name, name);
        graphQLField.type = new GraphQLList(
          getType(graffitiModels, { name: nestedObjectName, description, fields }, newPath, rootType));
      } else {
        graphQLField.type = new GraphQLList(stringToGraphQLType(subtype));
        if (reference) {
          resolveReference[rootType.name][name] = {
            name,
            type: reference,
            args: connectionArgs,
            resolve: addHooks((rootValue, args, context, info) => {
              args.id = rootValue[name].map((i) => i.toString());
              return connectionFromModel(graffitiModels[reference], args, context, info);
            }, hooks)
          };
        }
      }
    } else if (type === 'Object') {
      const fields = subfields;
      const nestedObjectName = getTypeFieldName(graphQLType.name, name);
      graphQLField.type = getType(graffitiModels, { name: nestedObjectName, description, fields }, newPath, rootType);
    } else if (type === 'Embedded') {
      const type = types.hasOwnProperty(name)
        ? types[name]
        : getType(graffitiModels, embeddedModel, ['embedded']);
      type.mongooseEmbedded = true;
      graphQLField.type = type;
    } else if (enumValues && type === 'String') {
      graphQLField.type = listToGraphQLEnumType(enumValues, getTypeFieldName(graphQLType.name, `${name}Enum`));
    } else {
      graphQLField.type = stringToGraphQLType(type);
    }

    if (reference && (graphQLField.type === GraphQLID || graphQLField.type === new GraphQLNonNull(GraphQLID))) {
      resolveReference[rootType.name][newPath.join('.')] = {
        name,
        type: reference,
        resolve: addHooks((rootValue, args, context, info) => {
          const resolver = getOneResolver(graffitiModels[reference]);
          return resolver(rootValue, { id: rootValue[name] ? rootValue[name].toString() : null }, context, info);
        }, hooks)
      };
    }

    if (nonNull && graphQLField.type) {
      graphQLField.type = new GraphQLNonNull(graphQLField.type);
    }

    if (!graphQLField.resolve) {
      graphQLField.resolve = addHooks((source) => source[name], hooks);
    }

    graphQLFields[name] = graphQLField;
    return graphQLFields;
  }, {});

  if (root) {
    // Implement the Node interface
    graphQLType.interfaces = [nodeInterface];
    graphQLTypeFields.id = globalIdField(name, (obj) => obj._id);
  }

  // Add fields to the GraphQL type
  graphQLType.fields = () => graphQLTypeFields;

  // Define type
  const GraphQLObjectTypeDefinition = new GraphQLObjectType(graphQLType);

  // Register type
  if (root) {
    addType(name, GraphQLObjectTypeDefinition);
  }

  return GraphQLObjectTypeDefinition;
}

function getTypes(graffitiModels) {
  const types = reduce(graffitiModels, (types, model) => {
    types[model.name] = getType(graffitiModels, model);
    return types;
  }, {});

  // Resolve references, all types are defined / avaiable
  forEach(resolveReference, (fields, typeName) => {
    const type = types[typeName];
    if (type) {
      const typeFields = reduce(fields, (typeFields, field, fieldName) => {
        if (field.args === connectionArgs) {
          // It's a connection
          const connectionName = getTypeFieldName(typeName, fieldName);
          const { connectionType } = connectionDefinitions({
            name: connectionName,
            nodeType: types[field.type],
            connectionFields: {
              count: {
                name: 'count',
                type: GraphQLFloat
              }
            }
          });
          field.type = connectionType;
        } else {
          // It's an object reference
          field.type = types[field.type];
        }

        // deeply find the path of the field we want to resolve the reference of
        const path = fieldName.split('.');

        path.reduce((parent, segment, idx) => {
          if (parent[segment]) {
            if (parent[segment].type instanceof GraphQLObjectType) {
              parent = getTypeFields(parent[segment].type);
            } else if (parent[segment].type instanceof GraphQLList &&
               parent[segment].type.ofType instanceof GraphQLObjectType) {
              parent = getTypeFields(parent[segment].type.ofType);
            }
          }

          if (idx === path.length - 1) {
            parent[segment] = field;
          }

          return parent;
        }, typeFields);

        return typeFields;
      }, getTypeFields(type));

      // Add new fields
      setTypeFields(type, typeFields);
    }
  });

  return types;
}

export default {
  getTypes
};

export {
  GraphQLViewer,
  GraphQLDate,
  GraphQLGeneric,
  getType,
  getTypes,
  addType,
  nodeInterface,
  getTypeFields,
  setTypeFields,
  getArguments
};
