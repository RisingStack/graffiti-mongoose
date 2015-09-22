import {find} from 'lodash';

/**
 * Generate projection object for mongoose
 * @method getProjection
 * @param {Object} fieldASTs
 * @return {Object} projection
 */
function getProjection(fieldASTs) {
  const {selections} = Array.isArray(fieldASTs) ? fieldASTs[0].selectionSet : fieldASTs.selectionSet;

  /*
   * FIXME: there is no way currently to get the required fields from "FragmentSpread"
   * workaround: don't do projection, select all of the fields
   * related issue: https://github.com/graphql/graphql-js/issues/96
   */
  let isFragmentSpread = find(selections, {
    kind: 'FragmentSpread'
  });

  if (isFragmentSpread) {
    return {};
  }

  // Get projection object
  return selections.reduce((projs, selection) => {
    switch (selection.kind) {
      case 'Field':
        return {
          ...projs, [selection.name.value]: 1
        };

      case 'InlineFragment':
        return {
          ...projs,
          ...getProjection(selection),
        };

      default:
        throw new Error('Unsupported query selection: ' + selection.kind);
    }
  }, {});
}

export {
  getProjection
}
