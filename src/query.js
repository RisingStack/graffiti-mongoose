import {reduce} from 'lodash';
import ObjectID from 'bson-objectid';

import {
  GraphQLString,
  GraphQLList
} from 'graphql/type';

import {getProjection} from './projection';
import {getField} from './field';

/**
 * @method getArgs
 * @param {Object} types
 * @param {Object} models - graffiti models
 * @return {Object} queryArgs
 */
function getArgs (types, models) {
  return reduce(models, (queryArgs, model) => {
    var args = reduce(model.fields, (args, field) => {
      if (field.indexed) {
        args[field.name] = getField(field, types, models, model);
      }

      return args;
    }, {});

    args._id = {
      name: '_id',
      type: GraphQLString,
      description: '"_id" field of the "${mode.name}" model with type "String"'
    };

    queryArgs[model.name] = args;

    return queryArgs;
  }, {});
}

/**
 * Create top level fields
 *
 * @method getRootFields
 * @param {Object} types
 * @param {Object} models
 * @return {Object} fields
 */
function getRootFields (types, models) {
  var queryArgs = getArgs(types, models);

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

        return models[typeName].model.findOne(filter, projections);
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

        return models[typeName].model.find(filter, projections);
      }
    };

    return fields;
  }, {});
}

export default {
  getArgs,
  getRootFields
};
