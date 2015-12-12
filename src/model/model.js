import {reduce, reduceRight, merge} from 'lodash';

/**
 * @method getField
 * @param schemaPaths
 * @return {Object} field
 */
function getField(schemaPath) {
  const {
    description,
    hidden,
    hooks,
    ref,
    index
  } = schemaPath.options || {};
  const name = schemaPath.path.split('.').pop();

  const field = {
    name,
    description,
    hidden,
    hooks,
    type: schemaPath.instance,
    nonNull: !!index
  };

  // ObjectID ref
  if (ref) {
    field.reference = ref;
  }

  // Caster
  if (schemaPath.caster) {
    const {
      instance,
      options
    } = schemaPath.caster;
    const {ref} = options || {};

    field.subtype = instance;

    // ObjectID ref
    if (ref) {
      field.reference = ref;
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
 * @param {Object} model Mongoose model
 * @return {Object} graffiti model
 */
function getModel(model) {
  const schemaPaths = model.schema.paths;
  const name = model.modelName;

  const fields = extractPaths(schemaPaths, {name});

  return {
    name,
    fields,
    model
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
  getModels
};

export {
  extractPath,
  extractPaths,
  getModel,
  getModels
};
