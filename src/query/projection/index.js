export default function getFieldList(context, fieldASTs) {
  if (!context) {
    return {};
  }

  fieldASTs = fieldASTs || context.fieldASTs;

  // for recursion...Fragments doesn't have many sets...
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
    switch (ast.kind) {
    case 'Field' :
      list[ast.name.value] = true;
      Object.assign(list, getFieldList({fieldASTs: ast}));
      return list;
    case 'InlineFragment':
      return {
        ...list,
        ...getFieldList(context, ast)
      };
    case 'FragmentSpread':
      return {
        ...list,
        ...getFieldList(context, context.fragments[ast.name.value])
      };
    default:
      throw new Error('Unsuported query selection');
    }
  }, {});
}
