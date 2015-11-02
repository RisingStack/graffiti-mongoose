import {expect} from 'chai';
import {toGlobalId} from 'graphql-relay';
import {
  _idToCursor,
  getIdFetcher,
  getOneResolver,
  getListResolver,
  connectionFromModel
} from './';

describe('query', () => {
  class MongooseObject {
    constructor(fields) {
      Object.assign(this, fields);
    }

    toObject() {
      return this;
    }
  }

  // mongoDB ID is 24 charachter long
  const fields = {name: 'foo'};
  const type = 'type';
  const objArray = [];
  const resultArray = [];
  for (let i = 0; i < 10; i++) {
    const objFields = {
      _id: `${i}`.repeat(24),
      ...fields
    };
    objArray.push(new MongooseObject(objFields));
    resultArray.push({
      _type: type,
      ...objFields
    });
  }

  const obj = objArray[0];
  const resultObj = resultArray[0];

  const graffitiModels = {
    type: {
      model: {
        modelName: type,
        findById(id) {
          const obj = objArray.find((obj) => {
            return obj._id === id;
          });
          return Promise.resolve(obj);
        },

        findOne() {
          return Promise.resolve(objArray[0]);
        },

        find() {
          return Promise.resolve(objArray);
        },

        count() {
          return Promise.resolve(objArray.length);
        }
      }
    }
  };

  describe('getIdFetcher', () => {
    it('should return an idFetcher function', () => {
      expect(getIdFetcher({})).instanceOf(Function);
    });

    it('should return an object based on a global id', async function getIdFetcherTest() {
      const id = toGlobalId('type', obj._id);

      const idFetcher = getIdFetcher(graffitiModels);
      const result = await idFetcher({}, {id});
      expect(result).to.eql(resultObj);
    });

    it('should return the Viewer instance', async function getIdFetcherTest() {
      const id = toGlobalId('Viewer', 'viewer');

      const idFetcher = getIdFetcher(graffitiModels);
      const result = await idFetcher({}, {id});
      expect(result).to.eql({_type: 'Viewer', id: 'viewer'});
    });
  });

  describe('getOneResolver', () => {
    let oneResolver;
    before(() => {
      oneResolver = getOneResolver(graffitiModels.type);
    });

    it('should return a function', () => {
      expect(oneResolver).instanceOf(Function);
    });

    it('should return an object', async function getOneResolverTest() {
      let result = await oneResolver({}, {id: obj._id});
      expect(result).to.eql(resultObj);

      const id = toGlobalId('type', obj._id);
      result = await oneResolver({}, {id});
      expect(result).to.eql(resultObj);
    });
  });

  describe('getListResolver', () => {
    let listResolver;
    before(() => {
      listResolver = getListResolver(graffitiModels.type);
    });

    it('should return a function', () => {
      expect(listResolver).instanceOf(Function);
    });

    it('should return an array of objects', async function getListResolverTest() {
      const result = await listResolver();
      expect(result).to.eql(resultArray);
    });
  });

  describe('connectionFromModel', () => {
    it('should return a connection', async function connectionFromModelTest() {
      const result = await connectionFromModel(graffitiModels.type, {});
      const edges = resultArray.map((obj) => {
        return {
          cursor: _idToCursor(obj._id),
          node: obj
        };
      });
      const startCursor = edges[0].cursor;
      const endCursor = edges[edges.length - 1].cursor;
      expect(result).to.containSubset({
        count: resultArray.length,
        edges,
        pageInfo: {
          startCursor,
          endCursor,
          hasPreviousPage: false,
          hasNextPage: false
        }
      });
    });
  });
});
