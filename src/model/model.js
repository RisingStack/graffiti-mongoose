import { reduce, reduceRight, merge } from 'lodash';
import mongoose from 'mongoose';

const embeddedModels = {};

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

  if (schemaPath.enumValues && schemaPath.enumValues.length > 0) {
    field.enumValues = schemaPath.enumValues;
  }

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
    const { ref } = options || {};

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
  const subNames = schemaPath.path.split('.');

  return reduceRight(subNames, (fields, name, key) => {
    const obj = {};

    if (schemaPath instanceof mongoose.Schema.Types.DocumentArray) {
      const subSchemaPaths = schemaPath.schema.paths;
      const fields = extractPaths(subSchemaPaths, { name }); // eslint-disable-line no-use-before-define
      obj[name] = {
        name,
        fields,
        nonNull: false,
        type: 'Array',
        subtype: 'Object'
      };
    } else if (schemaPath instanceof mongoose.Schema.Types.Embedded) {
      schemaPath.modelName = schemaPath.schema.options.graphqlTypeName || name;
      // embedded model must be unique Instance
      const embeddedModel = embeddedModels.hasOwnProperty(schemaPath.modelName)
        ? embeddedModels[schemaPath.modelName]
        : getModel(schemaPath); // eslint-disable-line no-use-before-define

      embeddedModels[schemaPath.modelName] = embeddedModel;
      obj[name] = {
        ...getField(schemaPath),
        embeddedModel
      };
    } else if (key === subNames.length - 1) {
      obj[name] = getField(schemaPath);
    } else {
      obj[name] = {
        name,
        fields,
        nonNull: false,
        type: 'Object'
      };
    }

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
  return reduce(schemaPaths, (fields, schemaPath) => (
    merge(fields, extractPath(schemaPath, model))
  ), {});
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

  const fields = extractPaths(schemaPaths, { name });

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
    .reduce((models, model) => ({
      ...models,
      [model.name]: model
    }), {});
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
