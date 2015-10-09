import {reduce, reduceRight, merge} from 'lodash';

/**
 * @method getField
 * @param schemaPaths
 * @return {Object} field
 */
function getField(schemaPath) {
  const options = schemaPath.options || {};
  const name = schemaPath.path.split('.').pop();

  const field = {
    name: name,
    type: schemaPath.instance,
    nonNull: options.index ? true : false,
    description: options.description,
    hidden: options.hidden
  };

  // Field options
  if (schemaPath.options) {
    // ObjectID ref
    if (schemaPath.options.ref) {
      field.reference = schemaPath.options.ref;
    }
  }

  // Caster
  if (schemaPath.caster) {
    field.subtype = schemaPath.caster.instance;

    // Caster options
    if (schemaPath.caster.options) {
      // ObjectID ref
      if (schemaPath.caster.options.ref) {
        field.reference = schemaPath.caster.options.ref;
      }
    }
  }

  return field;
}

/**
 * Extracts tree chunk from path if it's a sub-document
 * @method extractPath
 * @param {Object} schemaPath
 * @param {Object} model
 * @return {Object} field
 */
function extractPath(schemaPath) {
  const subs = schemaPath.path.split('.');
  const subNames = schemaPath.path.split('.');

  return reduceRight(subs, (field, sub, key) => {
    const obj = {};

    if (key === (subs.length - 1)) {
      obj[sub] = getField(schemaPath);
    } else {
      obj[sub] = {
        name: sub,
        nonNull: false,
        type: 'Object',
        fields: field
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
 * @param {Object} model
 * @return {Object) extractedSchemaPaths
 */
function extractPaths(schemaPaths, model) {
  return reduce(schemaPaths, (fields, schemaPath) => {
    return merge(fields, extractPath(schemaPath, model));
  }, {});
}

/**
 * Turn mongoose model to graffiti model
 * @method getModel
 * @param {Object} mongooseModel
 * @return {Object} graffiti model
 */
function getModel(mongooseModel) {
  const schemaPaths = mongooseModel.schema.paths;

  const fields = extractPaths(schemaPaths, {
    name: mongooseModel.modelName
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
function getModels(mongooseModels) {
  return mongooseModels
    .map(getModel)
    .reduce((models, model) => {
      models[model.name] = model;
      return models;
    }, {});
}

export default {
  extractPath,
  extractPaths,
  getModel,
  getModels
};
