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

  // Field options
  if (schemaPath.options) {

    // ObjectID ref
    if (schemaPath.options.ref) {
      field.ref = schemaPath.options.ref;
    }
  }

  // Caster
  if (schemaPath.caster) {
    field.caster = {
      path: schemaPath.caster.path,
      instance: schemaPath.caster.instance
    };

    // Caster options
    if (schemaPath.caster.options) {

      // ObjectID ref
      if (schemaPath.caster.options.ref) {
        field.caster.ref = schemaPath.caster.options.ref;
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
function extractPath(schemaPath, model) {
  let subs = schemaPath.path.split('.');
  var subNames = schemaPath.path.split('.');

  return reduceRight(subs, (field, sub, key) => {
    var path = subNames.join('.');
    var obj = {};

    if (key === (subs.length - 1)) {
      obj[sub] = getField(schemaPath);
    } else {
      obj[sub] = {
        name: sub,
        path: path,
        fullPath: `${model.name}.${path}`,
        indexed: false,
        instance: 'Object',
        caster: {
          fields: field
        }
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
function extractPaths (schemaPaths, model) {
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
function getModel (mongooseModel) {
  const schemaPaths = mongooseModel.schema.paths;

  let fields = extractPaths(schemaPaths, {
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
