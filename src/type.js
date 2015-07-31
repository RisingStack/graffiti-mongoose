import {reduce, each} from 'lodash';

import {
  GraphQLObjectType
} from 'graphql/type';

import {getField} from './field';

/**
 * @method getTypes
 * @param {Object} models
 * @return {Object} types
 */
function getTypes (models) {
  var types = reduce(models, (types, model) => {
    types[model.name] = new GraphQLObjectType({
      name: model.name,
      description: `"${model.name}" type`
    });

    return types;
  }, {});

  // Config types
  each(models, (model) => {

    // TODO: without internals?
    types[model.name]._typeConfig.fields = reduce(model.fields, (fields, field) => {
      var type = getField(field, types, models, model);

      if (type) {
        fields[field.name] = type;
      }

      return fields;
    }, {});
  });

  return types;
}

export default {
  getTypes
};
