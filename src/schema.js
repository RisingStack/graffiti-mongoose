import {reduce} from 'lodash';

import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLString,
  GraphQLList
} from 'graphql/lib/type';

import {getProjection} from './utils';

/**
 * @method getSchame
 * @param  {Array} models
 * @return {GraphQLSchema} schema
 */
function getSchema (models) {

  // Build schema
  var types = reduce(models, (types, model) => {
    var type = model.modelName;

    types[type] = new GraphQLObjectType({
      name: 'User',
      description: 'User creator'
    });

    // TODO: without internals?
    types[type]._typeConfig.fields = reduce(model.schema.paths, (paths, path) => {
      if (path.path === '__v') {
        return paths;
      }

      if (['String', 'ObjectID'].indexOf(path.instance) > -1) {
        paths[path.path] = {
          type: new GraphQLNonNull(GraphQLString)
        };
      } else if (path.instance === 'Array') {
        var type = path.caster.options.ref;

        paths[path.path] = {
          type: new GraphQLList(types[type]),
          resolve: (model, params, source, fieldASTs) => {
            var projections = getProjection(fieldASTs);
            return models[type].find({
              _id: {
                // to make it easily testable
                $in: model[path.path].map((id) => id.toString())
              }
            }, projections);
          }
        };
      }

      return paths;
    }, {});

    return types;
  }, {});

  var queryFields = reduce(types, (fields, type, typeName) => {
    fields[typeName.toLowerCase()] = {
      type: type,
      args: {
        id: {
          name: 'id',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: (root, {id}, source, fieldASTs) => {
        var projections = getProjection(fieldASTs);
        return models[typeName].findById(id, projections);
      }
    };

    return fields;
  }, {});

  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootQueryType',
      fields: queryFields
    })
  });
}

export var getSchema;
