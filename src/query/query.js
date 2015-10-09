import {fromGlobalId} from 'graphql-relay';
import getFieldList from './projection';

function processId({id, _id = id}) {
  // global or mongo id
  if (_id && _id.length !== 24) {
    return fromGlobalId(_id).id;
  }

  return _id;
}

function getOne(collection, args, info) {
  const id = processId(args);
  const projection = getFieldList(info);
  return collection.findById(id, projection).then((mObj) => {
    if (mObj) {
      return Object.assign({_type: collection.modelName}, mObj.toObject());
    }

    return null;
  });
}

function getList(collection, selector, options = {}, info = null) {
  if (selector && (Array.isArray(selector.id) || Array.isArray(selector._id))) {
    const {id, _id = id} = selector;
    delete selector._id;
    delete selector.id;
    selector._id = {
      $in: _id.map((id) => processId({id}))
    };
  }

  const projection = getFieldList(info);
  return collection.find(selector, projection, options).then((result) => {
    return result.map((value) => {
      return Object.assign({_type: collection.modelName}, value.toObject());
    });
  });
}

function getOneResolver(graffitiModel) {
  return (root, args, info) => {
    const collection = graffitiModel.model;
    if (collection) {
      return getOne(collection, args, info);
    }

    return null;
  };
}

function getListResolver(graffitiModel) {
  return (root, args, info) => {
    const collection = graffitiModel.model;
    if (collection) {
      return getList(collection, args, {}, info);
    }

    return null;
  };
}

/**
 * Returns the first element in a collection
 */
function getFirst(collection) {
  return collection.findOne({}, {}, {sort: {_id: 1}});
}

/**
 * Returns an idFetcher function, that can resolve
 * an object based on a global id
 */
function getIdFetcher(graffitiModels) {
  return function idFetcher(obj, {id: globalId}, info) {
    const {type, id} = fromGlobalId(globalId);
    const collection = graffitiModels[type].model;
    if (collection) {
      return getOne(collection, {id}, info);
    }

    return null;
  };
}

/**
 * Helper to get an empty connection.
 */
function emptyConnection() {
  return {
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
async function connectionFromModel(graffitiModel, args, info) {
  const collection = graffitiModel.model;
  if (!collection) {
    return emptyConnection();
  }

  const {before, after, first, last, id} = args;

  const begin = getId(after);
  const end = getId(before);

  const offset = (first - last) || 0;
  const limit = last || first;

  const selector = {};

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

  const result = await getList(collection, selector, {
    skip: offset,
    limit: limit,
    sort: {_id: 1}
  }, info);

  if (result.length === 0) {
    return emptyConnection();
  }

  const edges = result.map((value) => {
    return {
      cursor: idToCursor(value._id),
      node: value
    };
  });

  const firstElement = await getFirst(collection);
  return {
    edges: edges,
    pageInfo: {
      startCursor: edges[0].cursor,
      endCursor: edges[edges.length - 1].cursor,
      hasPreviousPage: cursorToId(edges[0].cursor) !== firstElement._id.toString(),
      hasNextPage: result.length === limit
    }
  };
}

export default {
  _idToCursor: idToCursor,
  getIdFetcher,
  getOneResolver,
  getListResolver,
  connectionFromModel
};
