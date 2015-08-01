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
 * @method resolveDateType
 * @param {Date} value
 * @return {String}
 */
function resolveDateType (value) {
  if (isDate(value)) {
    return value.toISOString();
  }

  // not a date
  return value;
}

/**
 * @method getField
 * @param {Object} field
 * @param {Object} types
 * @param {Object} models
 * @param {Object} model
 * @return {Object} field
 */
function getField(field, types, models, model) {
  var graphQLfield = {
    name: field.name,
    description: `"${field.name}" field of the "${model.name}" model with type "${field.instance}"`
  };

  if (field.caster) {
    graphQLfield.description += ` of "${field.caster.instance}"`;
  }

  var refModelName;

  // String
  if (['String', 'ObjectID'].indexOf(field.instance) > -1) {
    graphQLfield.type = GraphQLString;
  }

  // Number
  else if (field.instance === 'Number') {
    graphQLfield.type = GraphQLFloat;
  }

  // Date
  else if (field.instance === 'Date') {
    graphQLfield.type = GraphQLString;
    graphQLfield.resolve = (modelInstance, params, source, fieldASTs) =>
      resolveDateType(modelInstance[fieldASTs.name.value]);
  }

  // Boolean
  else if (field.instance === 'Boolean') {
    graphQLfield.type = GraphQLBoolean;
  }

  // Array
  else if (field.instance === 'Array') {

    // Array of ObjectId
    if (field.caster.instance === 'ObjectID') {
      refModelName = field.caster.ref;

      if (refModelName) {
        graphQLfield.description += ` and reference to "${refModelName}" model`;
      }

      graphQLfield.type = new GraphQLList(types[refModelName]);
      graphQLfield.resolve = (modelInstance, params, source, fieldASTs) => {
        var projections = getProjection(fieldASTs);
        return models[refModelName].model.find({
          _id: {
            // to make it easily testable
            $in: modelInstance[field.name].map((id) => id.toString())
          }
        }, projections);
      };
    }

    // Array of basic types
    else {
      if (field.caster.instance === 'Number') {
        graphQLfield.type = new GraphQLList(GraphQLFloat);
      } else if (field.caster.instance === 'String') {
        graphQLfield.type = new GraphQLList(GraphQLString);
      } else if (field.caster.instance === 'Boolean') {
        graphQLfield.type = new GraphQLList(GraphQLBoolean);
      } else if (field.caster.instance === 'Date') {
        graphQLfield.type = new GraphQLList(GraphQLString);
        graphQLfield.resolve = (modelInstance, params, source, fieldASTs) =>
          modelInstance[fieldASTs.name.value].map(resolveDateType);
      }
    }
  }

  return graphQLfield;
}

export default {
  getField
};
