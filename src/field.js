import {isDate} from 'lodash';

import {
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLList
}
from 'graphql/type';

import {getProjection} from './projection';

/**
 * @method getField
 * @param {Object} field
 * @param {Object} types
 * @param {Object} models
 * @return {Object} field
 */
function getField(field, types, models) {
  if (field.name === '__v') {
    return;
  }

  // String
  if (['String', 'ObjectID'].indexOf(field.instance) > -1) {
    return {
      type: GraphQLString
    };

    // Number
  } else if (field.instance === 'Number') {
    return {
      type: GraphQLFloat
    };

    // Date
  } else if (field.instance === 'Date') {
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
  } else if (field.instance === 'Boolean') {
    return {
      type: GraphQLBoolean
    };

    // Array
  } else if (field.instance === 'Array') {
    var type;

    // Array of refs
    if (field.caster.instance === 'ObjectID') {
      type = field.caster.ref;

      return {
        type: new GraphQLList(types[type]),
        resolve: (modelInstance, params, source, fieldASTs) => {
          var projections = getProjection(fieldASTs);
          return models[type].model.find({
            _id: {
              // to make it easily testable
              $in: modelInstance[field.name].map((id) => id.toString())
            }
          }, projections);
        }
      };

      // Array of primitives
    } else {
      if (field.caster.instance === 'Number') {
        return {
          type: new GraphQLList(GraphQLFloat)
        };
      } else if (field.caster.instance === 'String') {
        return {
          type: new GraphQLList(GraphQLString)
        };
      } else if (field.caster.instance === 'Boolean') {
        return {
          type: new GraphQLList(GraphQLBoolean)
        };
      } else if (field.caster.instance === 'Date') {
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
}

export default {
  getField
};
