import {reduce} from 'lodash';
import ObjectID from 'bson-objectid';

import {
  GraphQLString,
  GraphQLList
} from 'graphql/type';

import {getProjection} from './projection';
import field from './field';

/**
 * @method getArgs
 * @param {Object} types
 * @param {Object} models
 * @return {Object} queryArgs
 */
function getArgs (types, models) {
  var modelMap = reduce(models, (map, model) => {
    map[model.modelName] = model;

    return map;
  }, {});

  return reduce(modelMap, (queryArgs, model, modelName) => {
    var args = reduce(model.schema.paths, (args, path) => {
      var isIndexed = path.options && path.options.index === true;

      if (isIndexed) {
        args[path.path] = field.get(path, types, models);
      }

      return args;
    }, {});

    args._id = {
      name: '_id',
      type: GraphQLString
    };

    queryArgs[modelName] = args;

    return queryArgs;
  }, {});
}

/**
 * Create top level fields
 *
 * @method getRootFields
 * @param {Object} types
 * @param {Object} models
 * @param {Object} queryArgs
 * @return {Object} fields
 */
function getRootFields (types, models, queryArgs) {
  var modelMap = reduce(models, (map, model) => {
    map[model.modelName] = model;

    return map;
  }, {});

  return reduce(types, (fields, type, typeName) => {
    var singularName = `${typeName.toLowerCase()}`;
    var pluralName = `${typeName.toLowerCase()}s`;

    var singularArgs = queryArgs[typeName];
    var pluralArgs = reduce(queryArgs[typeName], (args, arg, argName) => {
      if (argName === '_id') {
        args[argName] = {
          type: new GraphQLList(arg.type)
        };
      } else {
        args[argName] = arg;
      }

      return args;
    }, {});

    // singular root field
    fields[singularName] = {
      type: type,
      args: singularArgs,
      resolve: (root, args, source, fieldASTs) => {
        var projections = getProjection(fieldASTs);

        var filter = reduce(args, (args, arg, argName) => {
          if (arg && argName === '_id') {
            args[argName] = new ObjectID(arg);
          } else if (arg) {
            args[argName] = arg;
          }

          return args;
        }, {});

        return modelMap[typeName].findOne(filter, projections);
      }
    };

    // plural root field
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
}

export default {
  getArgs,
  getRootFields
};
