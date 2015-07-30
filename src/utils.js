/**
 * Generate projection object for mongoose
 * TODO: Handle sub-documents
 * @param  {Object} fieldASTs
 * @return {Project}
 */
export function getProjection(fieldASTs) {
  const { selections } = fieldASTs.selectionSet;
  return selections.reduce((projs, selection) => {
    switch (selection.kind) {
      case 'Field':
        return {
          ...projs,
          [selection.name.value]: 1,
        };
      case 'InlineFragment':
        return {
          ...projs,
          ...getProjection(selection),
        };
      default:
        throw 'Unsupported query';
    }
  }, {});
}

