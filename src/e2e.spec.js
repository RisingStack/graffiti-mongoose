import {expect} from 'chai';

import {getSchema, getTypes, graphql} from './index';
import User from '../fixture/user';

describe('e2e', () => {
  describe('get types', () => {
    it('should generate types from mongoose models', () => {
      let types = getTypes([User]);

      expect(types).to.containSubset({
        User: {
          _typeConfig: {
            fields: {
              __v: {},
              _id: {},
              age: {},
              bools: {},
              createdAt: {},
              dates: {},
              friends: {},
              name: {},
              nums: {},
              removed: {},
              strings: {},
              weight: {}
            }
          }
        }
      });
    });
  });

  describe('get schema', () => {
    let user1;
    let user2;
    let schema;

    beforeEach(function* () {
      schema = getSchema([User]);

      user1 = new User({
        name: 'Foo',
        age: 28
      });

      yield user1.save();

      user2 = new User({
        name: 'Bar',
        age: 28,
        friends: [user1._id]
      });

      yield user2.save();
    });

    afterEach(function* () {
      yield [user1.remove(), user2.remove()];
    });

    it('should generate schema from mongoose models', () => {
      expect(schema).to.containSubset({
        _schemaConfig: {
          query: {
            name: 'RootQueryType',
            description: 'Query schema for Graffiti'    
          }
        }
      });
    });

    describe('singular query', () => {
      it('should get data from database by _id', function* () {
        let result = yield graphql(schema, `{
          user(_id: "${user2._id}") {
            _id
            name
            age
            friends {
              _id
              name
            }
          }
        }`);

        expect(result).to.be.eql({
          data: {
            user: {
              _id: user2._id.toString(),
              name: 'Bar',
              age: 28,
              friends: [{
                _id: user1._id.toString(),
                name: 'Foo'
              }]
            },
          }
        });
      });

      it('should support inline fragments', function* () {
        let result = yield graphql(schema, `{
          user(_id: "${user2._id}") {
            _id
            name,
            ... on User {
              age
            }
            friends {
              _id
              ... on User {
                name
              },
              age
            }
          }
        }`);

        expect(result).to.be.eql({
          data: {
            user: {
              _id: user2._id.toString(),
              name: 'Bar',
              age: 28,
              friends: [{
                _id: user1._id.toString(),
                name: 'Foo',
                age: 28
              }]
            },
          }
        });
      });
    });

    describe('plural query', () => {
      it('should get data from database and filter by number', function* () {
        let result = yield graphql(schema, `{
          users(age: 28) {
            _id
            name
            age
            friends {
              _id
              name
            }
          }
        }`);

        expect(result.data.users).to.deep.include.members([
          {
            _id: user1._id.toString(),
            name: 'Foo',
            age: 28,
            friends: []
          }, {
            _id: user2._id.toString(),
            name: 'Bar',
            age: 28,
            friends: [{
              _id: user1._id.toString(),
              name: 'Foo'
            }]
          }
        ]);
      });

      it('should get data from database and filter by array of _id(s)', function* () {
        let result = yield graphql(schema, `{
          users(_id: ["${user1._id}", "${user2._id}"]) {
            _id
          }
        }`);

        expect(result).to.be.eql({
          data: {
            users: [{
              _id: user1._id.toString()
            }, {
              _id: user2._id.toString()
            }],
          }
        });
      });
    });
  });
});
