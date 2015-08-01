import {reduce, reduceRight, merge} from 'lodash';

/**
 * @method getField
 * @param schemaPaths
 * @return {Object} field
 */
function getField (schemaPath) {
  var options = schemaPath.options || {};
  var name = schemaPath.path.split('.').pop();

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
}

/**
 * Extracts tree chunk from path if it's a sub-document
 * @method extractPath
 * @param {Object} schemaPath
 * @return {Object} field
 */
function extractPath(schemaPath) {
  let subs = schemaPath.path.split('.');
  var subNames = schemaPath.path.split('.');

  return reduceRight(subs, (field, sub, key) => {
    var obj = {};

    if (key === (subs.length - 1)) {
      obj[sub] = getField(schemaPath);
    } else {
      obj[sub] = {
        name: sub,
        path: subNames.join('.'),
        indexed: false,
        instance: 'Object',
        caster: field
      };
    }

    subNames.pop();

    return obj;
  }, {});
}

/**
 * Merge sub-document tree chunks
 * @method extractPaths
 * @param {Object} schemaPaths
 * @return {Object) extractedSchemaPaths
 */
function extractPaths (schemaPaths) {
  return reduce(schemaPaths, (fields, schemaPath) => {
    return merge(fields, extractPath(schemaPath));
  }, {});
}

/**
 * Turn mongoose model to graffiti model
 * @method getModel
 * @param {Object} mongooseModel
 * @return {Object} graffiti model
 */
function getModel (mongooseModel) {
  const schemaPaths = mongooseModel.schema.paths;

  let fields = extractPaths(schemaPaths);

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
function getModels (mongooseModels) {
  return mongooseModels
    .map(getModel)
    .reduce((models, model) => {
      models[model.name] = model;
      return models;
    }, {});
}

export {
  extractPath,
  extractPaths,
  getModel,
  getModels
};
