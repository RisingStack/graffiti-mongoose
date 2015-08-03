import {isDate} from 'lodash';
import ObjectID from 'bson-objectid';

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

  // ObjectID
  if (field.instance === 'ObjectID') {

    // with reference
    if (field.ref) {
      graphQLfield.description += ` and reference to "${field.ref}" model`;

      graphQLfield.type = types[field.ref];
      graphQLfield.resolve = (modelInstance, params, source, fieldASTs) => {
        var projections = getProjection(fieldASTs);        

        return models[field.ref].model.findOne({
          _id: new ObjectID(modelInstance[field.name])
        }, projections);
      };
    }

    // without ref
    else {
      graphQLfield.type = GraphQLString;
    }
  }

  // String
  else if (field.instance === 'String') {
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

      // with reference
      if (field.caster.ref) {
        graphQLfield.description += ` and reference to "${field.caster.ref}" model`;

        graphQLfield.type = new GraphQLList(types[field.caster.ref]);
        graphQLfield.resolve = (modelInstance, params, source, fieldASTs) => {
          var projections = getProjection(fieldASTs);
          return models[field.caster.ref].model.find({
            _id: {
              // toString(): to make it easily testable
              $in: modelInstance[field.name].map((id) => id.toString())
            }
          }, projections);
        };
      }

      // without reference
      else {
        graphQLfield.type = new GraphQLList(GraphQLString);
      }
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

  // Object
  else if (field.instance === 'Object') {
    // TODO: implement
  }

  return graphQLfield;
}

export default {
  getField
};
