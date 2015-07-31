import {map} from 'lodash';

/**
 * Turn mongoose model to graffiti model
 * @method getModel
 * @param {Object} mongooseModel
 * @return {Object} graffiti model
 */
export function getModel (mongooseModel) {
  var fields = map(mongooseModel.schema.paths, (schemaPath, name) => {

    var options = schemaPath.options || {};

    var field = {
      name: name,
      path: schemaPath.path,
      instance: schemaPath.instance,
      indexed: options.index ? true : false
    };

    if (schemaPath.caster) {
      field.caster = {
        path: schemaPath.caster.path,
        instance: schemaPath.caster.instance
      };

      if (schemaPath.caster.options && schemaPath.caster.options.ref) {
        field.caster.ref = schemaPath.caster.options.ref;
      }
    }

    return field;
  });

  return {
    name: mongooseModel.modelName,
    fields: fields,
    model: mongooseModel
  };
}

/**
 * @method getModels
 * @param {Array} mongooseModels
 * @return {Object} - graffiti models
 */
export function getModels (mongooseModels) {
  return mongooseModels
    .map(getModel)
    .reduce((models, model) => {
      models[model.name] = model;
      return models;
    }, {});
}
