export default function getFieldList(context, fieldASTs) {
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
      selections.push(...source.selectionSet.selections);
    }

    return selections;
  }, []);

  // return fields
  return selections.reduce((list, ast) => {
    const {name, kind} = ast;

    switch (kind) {
    case 'Field':
      list[name.value] = true;
      return {
        ...list,
        ...getFieldList(context, ast)
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
