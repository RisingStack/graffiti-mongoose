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

    // Number
    } else if (path.instance === 'Number') {
      return {
        type: GraphQLInt
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
            type: new GraphQLList(GraphQLInt)
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

    // TODO: args -> filter by indexed fields

    // TODO: args by index and _id
    fields[singularName] = {
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

    fields[pluralName] = {
      type: new GraphQLList(type),
      resolve: (root, args, source, fieldASTs) => {
        var projections = getProjection(fieldASTs);
        return modelMap[typeName].find({}, projections);
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
