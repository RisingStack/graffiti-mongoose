import {reduce, each, isDate} from 'lodash';

import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList
} from 'graphql/lib/type';

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
    }

    // Number
    else if (path.instance === 'Number') {
      return {
        type: GraphQLInt
      };
    }

    // Date
    else if (path.instance === 'Date') {
      return {
        type: GraphQLString,
        resolve: (modelInstance, params, source, fieldASTs) => {
          if (isDate(modelInstance[fieldASTs.name.value])) {
            return modelInstance[fieldASTs.name.value].toISOString();
          }

          return null;
        }
      };
    }

    // Boolean
    else if (path.instance === 'Boolean') {
      return {
        type: GraphQLBoolean
      };
    }

    // Array
    else if (path.instance === 'Array') {
      var type = path.caster.options.ref;

      // Array of refs
      if (path.caster.instance === 'ObjectID') {
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
        return {
          // type: new GraphQLList(getField(path.caster))
        };
      }
    }

    // TODO: handle more type
  }

  // Create top level fields
  var queryFields = reduce(types, (fields, type, typeName) => {
    var name = `${typeName.toLowerCase()}`;

    // TODO support multiple data: user, users

    // TODO: args by index and _id
    fields[name] = {
      type: type,
      args: {
        id: {
          name: 'id',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: (root, {id}, source, fieldASTs) => {
        var projections = getProjection(fieldASTs);
        return modelMap[typeName].findById(id, projections);
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
