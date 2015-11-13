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
  GraphQLScalarType
} from 'graphql/type';
import {addHooks} from '../utils';
import GraphQLDate from './custom/date';
import GraphQLBuffer from './custom/buffer';
import GraphQLGeneric from './custom/generic';
import {connectionFromModel, getOneResolver} from './../query';

// registered types will be saved, we can access them later to resolve types
const types = [];

// Node interface
const {nodeInterface} = nodeDefinitions(null, (obj) => {
  // type resolver
  return obj._type ? types[obj._type] : null;
});

function addType(name, type) {
  types[name] = type;
}

const GraphQLViewer = new GraphQLObjectType({
  name: 'Viewer',
  interfaces: [nodeInterface]
});

// register viewer type
addType('Viewer', GraphQLViewer);

/**
 * Returns a GraphQL type based on a String representation.
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

function getTypeFields(type) {
  const fields = type._typeConfig.fields;
  return isFunction(fields) ? fields() : fields;
}

function setTypeFields(type, fields) {
  type._typeConfig.fields = () => fields;
}

function getArguments(type, args = {}) {
  const fields = getTypeFields(type);
  return reduce(fields, (args, field) => {
    if (field.type instanceof GraphQLNonNull && field.name !== 'id') {
      field.type = field.type.ofType;
    }

    if (field.type instanceof GraphQLScalarType) {
      args[field.name] = field;
    }

    return args;
  }, args);
}

// holds references to fields that later has to be resolved
const resolveReference = {};

/**
 * @return {Object} GraphQL type definition
 */
export default function getType(graffitiModels, {name, description, fields}, root = true) {
  const graphQLType = {name, description};

  // these references has to be resolved when all type definitions are avaiable
  resolveReference[graphQLType.name] = resolveReference[graphQLType.name] || {};
  const graphQLTypeFields = reduce(fields, (graphQLFields, {name, description, type, subtype, reference, nonNull, hidden, hooks, fields: subfields}, key) => {
    name = name || key;
    if (hidden || name.startsWith('__')) {
      return graphQLFields;
    }

    const graphQLField = {name, description};

    if (type === 'Array') {
      graphQLField.type = new GraphQLList(stringToGraphQLType(subtype));
      if (reference) {
        resolveReference[graphQLType.name][name] = {
          name: name,
          type: reference,
          args: connectionArgs,
          resolve: addHooks((rootValue, args, info) => {
            args.id = rootValue[name].map((i) => i.toString());
            return connectionFromModel(graffitiModels[reference], args, info);
          }, hooks)
        };
      }
    } else if (type === 'Object') {
      const fields = subfields;
      graphQLField.type = getType(graffitiModels, {name, description, fields}, false);
    } else {
      graphQLField.type = stringToGraphQLType(type);
    }

    if (reference && (graphQLField.type === GraphQLID || graphQLField.type === new GraphQLNonNull(GraphQLID))) {
      resolveReference[graphQLType.name][name] = {
        name: name,
        type: reference,
        resolve: addHooks((rootValue, args, info) => {
          const resolver = getOneResolver(graffitiModels[reference]);
          return resolver(rootValue, {id: rootValue[name].toString()}, info);
        }, hooks)
      };
    }

    if (nonNull && graphQLField.type) {
      graphQLField.type = new GraphQLNonNull(graphQLField.type);
    }

    if (!graphQLField.resolve) {
      graphQLField.resolve = addHooks((source) => {
        return source[name];
      }, hooks);
    }

    graphQLFields[name] = graphQLField;
    return graphQLFields;
  }, {});

  if (root) {
    // implement the Node interface
    graphQLType.interfaces = [nodeInterface];
    graphQLTypeFields.id = globalIdField(name, (obj) => obj._id);
  }

  graphQLType.fields = () => graphQLTypeFields;

  const GraphQLObjectTypeDefinition = new GraphQLObjectType(graphQLType);

  // register type
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

  // resolve references, all types are avaiable
  forEach(resolveReference, (fields, typeName) => {
    const type = types[typeName];
    if (type) {
      const typeFields = getTypeFields(type);
      forEach(fields, (field, fieldName) => {
        if (field.args === connectionArgs) {
          // it's a connection
          const {connectionType} = connectionDefinitions({name: fieldName, nodeType: types[field.type], connectionFields: {
            count: {
              name: 'count',
              type: GraphQLFloat
            }
          }});
          field.type = connectionType;
        } else {
          // it's an object reference
          field.type = types[field.type];
        }

        typeFields[fieldName] = field;
      });
      setTypeFields(type, typeFields);
    }
  });

  return types;
}

export default {
  GraphQLViewer,
  GraphQLDate,
  GraphQLGeneric,
  getType,
  getTypes,
  addType,
  nodeInterface,
  getTypeFields,
  getArguments
};
