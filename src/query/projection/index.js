function getFieldList(info, fieldNodes) {
  if (!info) {
    return {};
  }

  fieldNodes = fieldNodes || info.fieldNodes;

  // for recursion
  // Fragments doesn't have many sets
  let nodes = fieldNodes;
  if (!Array.isArray(nodes)) {
    nodes = nodes ? [nodes] : [];
  }

  // get all selectionSets
  const selections = nodes.reduce((selections, source) => {
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
          ...getFieldList(info, ast),
          [name.value]: true
        };
      case 'InlineFragment':
        return {
          ...list,
          ...getFieldList(info, ast)
        };
      case 'FragmentSpread':
        return {
          ...list,
          ...getFieldList(info, info.fragments[name.value])
        };
      default:
        throw new Error('Unsuported query selection');
    }
  }, {});
}

export default getFieldList;
