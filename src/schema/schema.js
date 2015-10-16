import {reduce} from 'lodash';
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLScalarType,
  GraphQLBoolean
} from 'graphql';
import {mutationWithClientMutationId} from 'graphql-relay';
import {getModels} from './../model';
import {getTypes, nodeInterface} from './../type';
import {
  getIdFetcher,
  getOneResolver,
  getListResolver,
  getAddOneMutateHandler,
  getUpdateOneMutateHandler,
  getDeleteOneMutateHandler
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

  const allFields = type._typeConfig.fields();
  const args = reduce(allFields, (args, field) => {
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

  const addName = `add${name}`;
  const updateName = `update${name}`;
  const deleteName = `delete${name}`;

  return {
    [addName]: mutationWithClientMutationId({
      name: addName,
      inputFields: args,
      outputFields: allFields,
      mutateAndGetPayload: getAddOneMutateHandler(graffitiModel)
    }),
    [updateName]: mutationWithClientMutationId({
      name: updateName,
      inputFields: {
        ...args,
        id: {
          type: new GraphQLNonNull(GraphQLID),
          description: `The ID of a ${name}`
        }
      },
      outputFields: allFields,
      mutateAndGetPayload: getUpdateOneMutateHandler(graffitiModel)
    }),
    [deleteName]: mutationWithClientMutationId({
      name: deleteName,
      inputFields: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
          description: `The ID of a ${name}`
        }
      },
      outputFields: {
        ok: {type: GraphQLBoolean}
      },
      mutateAndGetPayload: getDeleteOneMutateHandler(graffitiModel)
    })
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
    fields: {
      viewer: {
        type: new GraphQLObjectType({
          name: 'Viewer',
          fields: queries
        })
      },
      ...queries
    }
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
