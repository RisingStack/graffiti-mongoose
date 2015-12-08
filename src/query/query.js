import {forEach, isArray, isString} from 'lodash';
import {fromGlobalId, toGlobalId} from 'graphql-relay';
import getFieldList from './projection';
import viewer from '../model/viewer';

function processId({id, _id = id}) {
  // global or mongo id
  if (isString(_id) && _id.length === 40 && _id.endsWith('=')) {
    return fromGlobalId(_id).id;
  }

  return _id;
}

function getCount(Collection, selector) {
  if (selector && (isArray(selector.id) || isArray(selector._id))) {
    const {id, _id = id} = selector;
    delete selector._id;
    delete selector.id;
    selector._id = {
      $in: _id.map((id) => processId({id}))
    };
  }

  return Collection.count(selector);
}

function getOne(Collection, args, info) {
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
      args[key] = arg.map((id) => processId({id}));
    } else {
      args[key] = processId({id: arg});
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

function updateOne(Collection, args, info) {
  const _id = processId(args);
  delete args.id;
  delete args._id;

  forEach(args, (arg, key) => {
    if (isArray(arg)) {
      args[key] = arg.map((id) => processId({id}));
    } else {
      args[key] = processId({id: arg});
    }
  });

  return Collection.update({_id}, args).then((res) => {
    if (res.ok) {
      return getOne(Collection, {_id}, info);
    }

    return null;
  });
}

function deleteOne(Collection, args) {
  const _id = processId(args);
  delete args.id;
  delete args._id;
  return Collection.remove({_id}).then(({result}) => {
    return {
      id: toGlobalId(Collection.modelName, _id),
      ok: !!result.ok
    };
  });
}

function getList(Collection, selector, options = {}, info = null) {
  if (selector && (isArray(selector.id) || isArray(selector._id))) {
    const {id, _id = id} = selector;
    delete selector._id;
    delete selector.id;
    selector._id = {
      $in: _id.map((id) => processId({id}))
    };
  }

  const projection = getFieldList(info);
  return Collection.find(selector, projection, options).then((result) => {
    return result.map((value) => {
      return {
        ...value.toObject(),
        _type: Collection.modelName
      };
    });
  });
}

function getOneResolver(graffitiModel) {
  return (root, args, info) => {
    const Collection = graffitiModel.model;
    if (Collection) {
      return getOne(Collection, args, info);
    }

    return null;
  };
}

function getAddOneMutateHandler(graffitiModel) {
  return (args) => {
    const Collection = graffitiModel.model;
    if (Collection) {
      return addOne(Collection, args);
    }

    return null;
  };
}

function getUpdateOneMutateHandler(graffitiModel) {
  return (args) => {
    const Collection = graffitiModel.model;
    if (Collection) {
      return updateOne(Collection, args);
    }

    return null;
  };
}

function getDeleteOneMutateHandler(graffitiModel) {
  return (args) => {
    const Collection = graffitiModel.model;
    if (Collection) {
      return deleteOne(Collection, args);
    }

    return null;
  };
}

function getListResolver(graffitiModel) {
  return (root, args, info) => {
    if (args && args.ids) {
      args.id = args.ids;
      delete args.ids;
    }

    const Collection = graffitiModel.model;
    if (Collection) {
      return getList(Collection, args, {}, info);
    }

    return null;
  };
}

/**
 * Returns the first element in a Collection
 */
function getFirst(Collection) {
  return Collection.findOne({}, {}, {sort: {_id: 1}});
}

/**
 * Returns an idFetcher function, that can resolve
 * an object based on a global id
 */
function getIdFetcher(graffitiModels) {
  return function idFetcher(obj, {id: globalId}, info) {
    const {type, id} = fromGlobalId(globalId);

    if (type === 'Viewer') {
      return viewer;
    } else if (graffitiModels[type]) {
      const Collection = graffitiModels[type].model;
      return getOne(Collection, {id}, info);
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
async function connectionFromModel(graffitiModel, args, info) {
  const Collection = graffitiModel.model;
  if (!Collection) {
    return emptyConnection();
  }

  const {before, after, first, last, id, orderBy = {_id: 1}, ...selector} = args;

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
    skip: offset,
    limit: limit,
    sort: orderBy
  }, info);
  const count = await getCount(Collection, selector);

  if (result.length === 0) {
    return emptyConnection();
  }

  const edges = result.map((value) => {
    return {
      cursor: idToCursor(value._id),
      node: value
    };
  });

  const firstElement = await getFirst(Collection);
  return {
    count,
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
  idToCursor,
  getIdFetcher,
  getOneResolver,
  getAddOneMutateHandler,
  getUpdateOneMutateHandler,
  getDeleteOneMutateHandler,
  getListResolver,
  connectionFromModel
};
