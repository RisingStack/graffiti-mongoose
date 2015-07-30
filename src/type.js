import {reduce, each} from 'lodash';

import {
  GraphQLObjectType
} from 'graphql/type';

import field from './field';

/**
 * @method get
 * @param {Object} models
 * @return {Object} types
 */
function get (models) {
  var types = reduce(models, (types, model) => {
    var modelName = model.modelName;

    types[modelName] = new GraphQLObjectType({
      name: modelName
    });

    return types;
  }, {});

  // Config types
  each(models, (model) => {
    var modelName = model.modelName;

    // TODO: without internals?
    types[modelName]._typeConfig.fields = reduce(model.schema.paths, (fields, path) => {
      var fieldType = field.get(path, types, models);
      var fieldName = path.path;

      if (fieldType) {
        fields[fieldName] = fieldType;
      }

      return fields;
    }, {});
  });

  return types;
}

export default {
  get
};

