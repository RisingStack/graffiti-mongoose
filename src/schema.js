import {map, reduce, each, isDate, isArray} from 'lodash';
import ObjectID from 'bson-objectid';

import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLList
} from 'graphql/type';

import {getProjection} from './utils';

/**
 * @method getSchame
 * @param  {Array} models
 * @return {GraphQLSchema} schema
 */
function getSchema (models) {

  // Convert array of models to map
  var modelMap = reduce(models, (map, model) => {
    map[model.modelName] = model;

    return map;
  }, {});

  // Create types
  var types = reduce(modelMap, (types, model, modelName) => {
    types[modelName] = new GraphQLObjectType({
      name: modelName
    });

    return types;
  }, {});

  // Config types
  each(modelMap, (model, modelName) => {

    // TODO: without internals?
    types[modelName]._typeConfig.fields = reduce(model.schema.paths, (fields, path) => {
      var field = getField(path);
      var fieldName = path.path;

      if (field) {
        fields[fieldName] = field;
      }

      return fields;
    }, {});
  });

  // Model args
  var modelArgs = reduce(modelMap, (modelArgs, model, modelName) => {
    var args = reduce(model.schema.paths, (args, path) => {
      var isIndexed = path.options && path.options.index === true;

      if (isIndexed) {
        args[path.path] = getField(path);
      }

      return args;
    }, {});

    args._id = {
      name: '_id',
      type: GraphQLString
    };

    modelArgs[modelName] = args;

    return modelArgs;
  }, {});

  /**
   * @method getField
   * @param  {Object} path
   * @return {Object} field
   */
  function getField (path) {
    if (path.path === '__v') {
      return;
    }

    // String
    if (['String', 'ObjectID'].indexOf(path.instance) > -1) {
      return {
        type: GraphQLString
      };

    // Number
    } else if (path.instance === 'Number') {
      return {
        type: GraphQLFloat
      };

    // Date
    } else if (path.instance === 'Date') {
      return {
        type: GraphQLString,
        resolve: (modelInstance, params, source, fieldASTs) => {
          if (isDate(modelInstance[fieldASTs.name.value])) {
            return modelInstance[fieldASTs.name.value].toISOString();
          }

          return null;
        }
      };

      // Boolean
    } else if (path.instance === 'Boolean') {
      return {
        type: GraphQLBoolean
      };

      // Array
    } else if (path.instance === 'Array') {
      var type;

      // Array of refs
      if (path.caster.instance === 'ObjectID') {
        type = path.caster.options.ref;

        return {
          type: new GraphQLList(types[type]),
          resolve: (modelInstance, params, source, fieldASTs) => {
            var projections = getProjection(fieldASTs);
            return modelMap[type].find({
              _id: {
                // to make it easily testable
                $in: modelInstance[path.path].map((id) => id.toString())
              }
            }, projections);
          }
        };

      // Array of primitives
      // FIXME: cannot handle array
      } else {
        if (path.caster.instance === 'Number') {
          return {
            type: new GraphQLList(GraphQLFloat)
          };
        } else if (path.caster.instance === 'String') {
          return {
            type: new GraphQLList(GraphQLString)
          };
        } else if (path.caster.instance === 'Boolean') {
          return {
            type: new GraphQLList(GraphQLBoolean)
          };
        } else if (path.caster.instance === 'Date') {
          return {
            type: new GraphQLList(GraphQLString),
            resolve: (modelInstance, params, source, fieldASTs) => {
              return modelInstance[fieldASTs.name.value].map((value) => {
                if (isDate(value)) {
                  return value.toISOString();
                }

                return null;
              });
            }
          };
        }
      }
    }

    // TODO: handle more type
  }

  // Create top level fields
  var queryFields = reduce(types, (fields, type, typeName) => {
    var singularName = `${typeName.toLowerCase()}`;

    // TODO handle non s ended plurarls
    var pluralName = `${typeName.toLowerCase()}s`;

    var singularArgs = modelArgs[typeName];
    var pluralArgs = reduce(modelArgs[typeName], (args, arg, argName) => {
      if (argName === '_id') {
        args[argName] = {
          type: new GraphQLList(arg.type)
        };
      } else {
        args[argName] = arg;
      }

      return args;
    }, {});

    // TODO: args -> filter by indexed fields

    // TODO: args by index and _id
    fields[singularName] = {
      type: type,
      args: singularArgs,
      resolve: (root, args, source, fieldASTs) => {
        var projections = getProjection(fieldASTs);

        var filter = reduce(args, (args, arg, argName) => {
          if (arg && argName === '_id') {
            args[argName] = ObjectID(arg);
          } else if (arg) {
            args[argName] = arg;
          }

          return args;
        }, {});

        return modelMap[typeName].findOne(filter, projections);
      }
    };

    fields[pluralName] = {
      type: new GraphQLList(type),
      args: pluralArgs,
      resolve: (root, args, source, fieldASTs) => {
        var projections = getProjection(fieldASTs);

        var filter = reduce(args, (args, arg, argName) => {
          if (arg && argName === '_id') {
            args[argName] = {
              $in: arg
            };
          } else if (arg) {
            args[argName] = arg;
          }

          return args;
        }, {});

        return modelMap[typeName].find(filter, projections);
      }
    };

    return fields;
  }, {});

  // Create schema
  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootQueryType',
      fields: queryFields
    })
  });
}

export var getSchema;
