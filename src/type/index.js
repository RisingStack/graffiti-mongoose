import {reduce, forEach} from 'lodash';

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
  GraphQLNonNull
} from 'graphql/type';
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

// holds references to fields that later has to be resolved
const resolveReference = {};

/**
 * @method getType
 * @param {Object} collections
 * @return {Object} GraphQL type definition
 */
export default function getType(graffitiModels, {name, description, fields}, root = true) {
  const graphQLType = {name, description};

  // these references has to be resolved when all type definitions are avaiable
  resolveReference[graphQLType.name] = resolveReference[graphQLType.name] || {};
  const graphQLTypeFields = reduce(fields, (result, {name, description, instance, caster, ref}, key) => {
    name = name || key;
    const graphQLField = {name, description};

    if (instance === 'Array') {
      graphQLField.type = new GraphQLList(stringToGraphQLType(caster.instance));
      if (caster.ref) {
        const typeName = caster.ref;
        resolveReference[graphQLType.name][name] = {
          name: name,
          type: typeName,
          args: connectionArgs,
          resolve: (rootValue, args, info) => {
            args.id = rootValue[name].map((i) => i.toString());
            return connectionFromModel(graffitiModels[typeName], args, info);
          }
        };
      }
    } else if (instance === 'Object') {
      const fields = caster.fields;
      graphQLField.type = getType(graffitiModels, {name, description, fields}, false);
    } else {
      graphQLField.type = stringToGraphQLType(instance);
    }

    if (ref && (graphQLField.type === GraphQLID || graphQLField.type === new GraphQLNonNull(GraphQLID))) {
      const typeName = ref;
      resolveReference[graphQLType.name][name] = {
        name: name,
        type: typeName,
        resolve: (rootValue, args, info) => {
          const resolver = getOneResolver(graffitiModels[typeName]);
          return resolver(rootValue, {id: rootValue[name].toString()}, info);
        }
      };
    }

    result[name] = graphQLField;
    return result;
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
    types[name] = GraphQLObjectTypeDefinition;
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
      const typeFields = type._typeConfig.fields();
      forEach(fields, (field, fieldName) => {
        if (field.args === connectionArgs) {
          // it's a connection
          const {connectionType} = connectionDefinitions({name: fieldName, nodeType: types[field.type]});
          field.type = connectionType;
        } else {
          // it's an object reference
          field.type = types[field.type];
        }

        typeFields[fieldName] = field;
      });
      type._typeConfig.fields = () => typeFields;
    }
  });

  return types;
}

export default {
  GraphQLDate,
  GraphQLGeneric,
  getType,
  getTypes,
  nodeInterface
};
