import { forEach, isArray, isString } from 'lodash';
import { fromGlobalId, toGlobalId } from 'graphql-relay';
import getFieldList from './projection';
import viewer from '../model/viewer';

function processId({ id, _id = id }) {
  // global or mongo id
  if (isString(_id) && !/^[a-fA-F0-9]{24}$/.test(_id)) {
    const { type, id } = fromGlobalId(_id);
    if (type && /^[a-zA-Z]*$/.test(type)) {
      return id;
    }
  }

  return _id;
}

function getCount(Collection, selector) {
  if (selector && (isArray(selector.id) || isArray(selector._id))) {
    const { id, _id = id } = selector;
    delete selector.id;
    selector._id = {
      $in: _id.map((id) => processId({ id }))
    };
  }

  return Collection.count(selector);
}

function getOne(Collection, args, context, info) {
  const id = processId(args);
  const projection = getFieldList(info);
  return Collection.findById(id, projection).then((result) => {
    if (result) {
      return {
        ...result.toObject(),
        _type: Collection.modelName
      };
    }

    return null;
  });
}

function addOne(Collection, args) {
  forEach(args, (arg, key) => {
    if (isArray(arg)) {
      args[key] = arg.map((id) => processId({ id }));
    } else {
      args[key] = processId({ id: arg });
    }
  });

  const instance = new Collection(args);
  return instance.save().then((result) => {
    if (result) {
      return {
        ...result.toObject(),
        _type: Collection.modelName
      };
    }

    return null;
  });
}

function updateOne(Collection, { id, _id, ...args }, context, info) {
  _id = processId({ id, _id });

  forEach(args, (arg, key) => {
    if (isArray(arg)) {
      args[key] = arg.map((id) => processId({ id }));
    } else {
      args[key] = processId({ id: arg });
    }

    if (key.endsWith('_add')) {
      const values = args[key];
      args.$push = {
        [key.slice(0, -'_add'.length)]: { $each: values }
      };
      delete args[key];
    }
  });

  return Collection.update({ _id }, args).then((res) => {
    if (res.ok) {
      return getOne(Collection, { _id }, context, info);
    }

    return null;
  });
}

function deleteOne(Collection, args) {
  const _id = processId(args);

  return Collection.remove({ _id }).then(({ result }) => ({
    id: toGlobalId(Collection.modelName, _id),
    ok: !!result.ok
  }));
}

function getList(Collection, selector, options = {}, context, info = null) {
  if (selector && (isArray(selector.id) || isArray(selector._id))) {
    const { id, _id = id } = selector;
    delete selector.id;
    selector._id = {
      $in: _id.map((id) => processId({ id }))
    };
  }

  const projection = getFieldList(info);
  return Collection.find(selector, projection, options).then((result) => (
    result.map((value) => ({
      ...value.toObject(),
      _type: Collection.modelName
    }))
  ));
}

function getOneResolver(graffitiModel) {
  return (root, args, context, info) => {
    const Collection = graffitiModel.model;
    if (Collection) {
      return getOne(Collection, args, context, info);
    }

    return null;
  };
}

function getAddOneMutateHandler(graffitiModel) {
  // eslint-disable-next-line no-unused-vars
  return ({ clientMutationId, ...args }) => {
    const Collection = graffitiModel.model;
    if (Collection) {
      return addOne(Collection, args);
    }

    return null;
  };
}

function getUpdateOneMutateHandler(graffitiModel) {
  // eslint-disable-next-line no-unused-vars
  return ({ clientMutationId, ...args }) => {
    const Collection = graffitiModel.model;
    if (Collection) {
      return updateOne(Collection, args);
    }

    return null;
  };
}

function getDeleteOneMutateHandler(graffitiModel) {
  // eslint-disable-next-line no-unused-vars
  return ({ clientMutationId, ...args }) => {
    const Collection = graffitiModel.model;
    if (Collection) {
      return deleteOne(Collection, args);
    }

    return null;
  };
}

function getListResolver(graffitiModel) {
  return (root, { ids, ...args } = {}, context, info) => {
    if (ids) {
      args.id = ids;
    }

    const { orderBy: sort } = args;
    delete args.orderBy;

    const Collection = graffitiModel.model;
    if (Collection) {
      return getList(Collection, args, { sort }, context, info);
    }

    return null;
  };
}

/**
 * Returns the first element in a Collection
 */
function getFirst(Collection) {
  return Collection.findOne({}, {}, { sort: { _id: 1 } });
}

/**
 * Returns an idFetcher function, that can resolve
 * an object based on a global id
 */
function getIdFetcher(graffitiModels) {
  return function idFetcher(obj, { id: globalId }, context, info) {
    const { type, id } = fromGlobalId(globalId);

    if (type === 'Viewer') {
      return viewer;
    } else if (graffitiModels[type]) {
      const Collection = graffitiModels[type].model;
      return getOne(Collection, { id }, context, info);
    }

    return null;
  };
}

/**
 * Helper to get an empty connection.
 */
function emptyConnection() {
  return {
    count: 0,
    edges: [],
    pageInfo: {
      startCursor: null,
      endCursor: null,
      hasPreviousPage: false,
      hasNextPage: false
    }
  };
}

const PREFIX = 'connection.';

function base64(i) {
  return ((new Buffer(i, 'ascii')).toString('base64'));
}

function unbase64(i) {
  return ((new Buffer(i, 'base64')).toString('ascii'));
}

/**
 * Creates the cursor string from an offset.
 */
function idToCursor(id) {
  return base64(PREFIX + id);
}

/**
 * Rederives the offset from the cursor string.
 */
function cursorToId(cursor) {
  return unbase64(cursor).substring(PREFIX.length);
}

/**
 * Given an optional cursor and a default offset, returns the offset
 * to use; if the cursor contains a valid offset, that will be used,
 * otherwise it will be the default.
 */
function getId(cursor) {
  if (cursor === undefined || cursor === null) {
    return null;
  }

  return cursorToId(cursor);
}

/**
 * Returns a connection based on a graffitiModel
 */
async function connectionFromModel(graffitiModel, args, context, info) {
  const Collection = graffitiModel.model;
  if (!Collection) {
    return emptyConnection();
  }

  const { before, after, first, last, id, orderBy = { _id: 1 }, ...selector } = args;

  const begin = getId(after);
  const end = getId(before);

  const offset = (first - last) || 0;
  const limit = last || first;

  if (id) {
    selector.id = id;
  }

  if (begin) {
    selector._id = selector._id || {};
    selector._id.$gt = begin;
  }

  if (end) {
    selector._id = selector._id || {};
    selector._id.$lt = end;
  }

  const result = await getList(Collection, selector, {
    limit,
    skip: offset,
    sort: orderBy
  }, context, info);
  const count = await getCount(Collection, selector);

  if (result.length === 0) {
    return emptyConnection();
  }

  const edges = result.map((value) => ({
    cursor: idToCursor(value._id),
    node: value
  }));

  const firstElement = await getFirst(Collection);
  return {
    count,
    edges,
    pageInfo: {
      startCursor: edges[0].cursor,
      endCursor: edges[edges.length - 1].cursor,
      hasPreviousPage: cursorToId(edges[0].cursor) !== firstElement._id.toString(),
      hasNextPage: result.length === limit
    }
  };
}

export default {
  getOneResolver,
  getListResolver,
  getAddOneMutateHandler,
  getUpdateOneMutateHandler,
  getDeleteOneMutateHandler
};

export {
  idToCursor as _idToCursor,
  idToCursor,
  getIdFetcher,
  getOneResolver,
  getAddOneMutateHandler,
  getUpdateOneMutateHandler,
  getDeleteOneMutateHandler,
  getListResolver,
  connectionFromModel
};
