import {reduce, isDate} from 'lodash';

import {
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLList
} from 'graphql/type';

import {getProjection} from './utils';

/**
 * @method get
 * @param {Object} path
 * @param {Object} types
 * @param {Object} models
 * @return {Object} field
 */
function get (path, types, models) {

  // Convert array of models to map
  var modelMap = reduce(models, (map, model) => {
    map[model.modelName] = model;

    return map;
  }, {});

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

export default {
  get
};

