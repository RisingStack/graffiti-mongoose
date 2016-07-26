function getFieldList(context, fieldASTs) {
  if (!context) {
    return {};
  }

  fieldASTs = fieldASTs || context.fieldASTs;

  // for recursion
  // Fragments doesn't have many sets
  let asts = fieldASTs;
  if (!Array.isArray(asts)) {
    asts = [asts];
  }

  // get all selectionSets
  const selections = asts.reduce((selections, source) => {
    if (source.selectionSet) {
      return selections.concat(source.selectionSet.selections);
    }

    return selections;
  }, []);

  // return fields
  return selections.reduce((list, ast) => {
    const { name, kind } = ast;

    switch (kind) {
      case 'Field':
        return {
          ...list,
          ...getFieldList(context, ast),
          [name.value]: true
        };
      case 'InlineFragment':
        return {
          ...list,
          ...getFieldList(context, ast)
        };
      case 'FragmentSpread':
        return {
          ...list,
          ...getFieldList(context, context.fragments[name.value])
        };
      default:
        throw new Error('Unsuported query selection');
    }
  }, {});
}

export default getFieldList;
