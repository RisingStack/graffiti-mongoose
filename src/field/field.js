import {reduce} from 'lodash';
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLScalarType,
  GraphQLInputObjectType
} from 'graphql';
import {getModels} from './../model';
import {getTypes, nodeInterface} from './../type';
import {
  getIdFetcher,
  getOneResolver,
  getListResolver,
  getAddOneResolver,
  getUpdateOneResolver
} from './../query';

function getQueryField(graffitiModel, type) {
  const {name} = type;
  const singularName = name.toLowerCase();
  const pluralName = `${name.toLowerCase()}s`;

  return {
    [singularName]: {
      type: type,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
          description: `The ID of a ${name}`
        }
      },
      resolve: getOneResolver(graffitiModel)
    },
    [pluralName]: {
      type: new GraphQLList(type),
      args: reduce(type._typeConfig.fields(), (args, field) => {
        if (field.type instanceof GraphQLNonNull && field.name !== 'id') {
          field.type = field.type.ofType;
        }

        if (field.type instanceof GraphQLScalarType) {
          args[field.name] = field;
        }

        return args;
      }, {
        id: {
          type: new GraphQLList(GraphQLID),
          description: `The ID of a ${name}`
        },
        ids: {
          type: new GraphQLList(GraphQLID),
          description: `The ID of a ${name}`
        }
      }),
      resolve: getListResolver(graffitiModel)
    }
  };
}

function getMutationField(graffitiModel, type) {
  const {name} = type;

  const allField = type._typeConfig.fields();
  const args = reduce(allField, (args, field) => {
    if (field.type instanceof GraphQLObjectType) {
      if (field.type.name.endsWith('Connection')) {
        args[field.name] = {
          name: field.name,
          type: new GraphQLList(GraphQLID)
        };
      }
      // TODO support objects
      // else {
      //   args = {...args, ...field.type._typeConfig.fields()};
      // }
    }
    if (!(field.type instanceof GraphQLObjectType) && field.name !== 'id' && !field.name.startsWith('_')) {
      args[field.name] = field;
    }
    return args;
  }, {});

  const addInputType = new GraphQLNonNull(new GraphQLInputObjectType({
    name: `${name}AddInput`,
    fields: () => ({
      ...args,
      clientMutationId: {
        name: 'clientMutationId',
        type: new GraphQLNonNull(GraphQLID)
      }
    })
  }));

  const updateInputType = new GraphQLNonNull(new GraphQLInputObjectType({
    name: `${name}UpdateInput`,
    fields: () => ({
      ...args,
      clientMutationId: {
        name: 'clientMutationId',
        type: new GraphQLNonNull(GraphQLID)
      },
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: `The ID of a ${name}`
      }
    })
  }));

  const outputType = new GraphQLObjectType({
    name: `${name}Payload`,
    fields: () => ({
      ...allField,
      clientMutationId: {
        name: 'clientMutationId',
        type: new GraphQLNonNull(GraphQLID)
      }
    })
  });

  return {
    [`add${name}`]: {
      type: outputType,
      args: {
        input: {
          name: 'input',
          type: addInputType
        }
      },
      resolve: (root, args, info) => {
        const clientMutationId = args.input.clientMutationId;
        delete args.input.clientMutationId;
        return getAddOneResolver(graffitiModel)(root, args.input, info).then((result) => {
          return {
            clientMutationId,
            ...result
          };
        });
      },
      resolveType: outputType
    },
    [`update${name}`]: {
      type: outputType,
      args: {
        input: {
          name: 'input',
          type: updateInputType
        }
      },
      resolve: (root, args, info) => {
        const clientMutationId = args.input.clientMutationId;
        delete args.input.clientMutationId;
        return getUpdateOneResolver(graffitiModel)(root, {id: args.id, ...args.input}, info).then((result) => {
          return {
            clientMutationId,
            ...result
          };
        });
      },
      resolveType: outputType
    }
  };
}

function getFields(graffitiModels) {
  const types = getTypes(graffitiModels);

  const {queries, mutations} = reduce(types, ({queries, mutations}, type, key) => {
    type.name = type.name || key;
    const graffitiModel = graffitiModels[type.name];
    return {
      queries: {
        ...queries,
        ...getQueryField(graffitiModel, type)
      },
      mutations: {
        ...mutations,
        ...getMutationField(graffitiModel, type)
      }
    };
  }, {
    queries: {
      node: {
        name: 'node',
        description: 'Fetches an object given its ID',
        type: nodeInterface,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'The ID of an object'
          }
        },
        resolve: getIdFetcher(graffitiModels)
      }
    },
    mutations: {}
  });

  const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: queries
  });

  const RootMutation = new GraphQLObjectType({
    name: 'RootMutation',
    fields: mutations
  });

  return {
    query: RootQuery,
    mutation: RootMutation
  };
}

function getSchema(mongooseModels) {
  const graffitiModels = getModels(mongooseModels);
  const fields = getFields(graffitiModels);
  return new GraphQLSchema(fields);
}

export default {
  getQueryField,
  getMutationField,
  getFields,
  getSchema
};
