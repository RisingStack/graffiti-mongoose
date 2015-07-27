import {expect} from 'chai';
import {graphql} from 'graphql';
import mongoose from 'mongoose';

import {getSchema} from './schema';
import User from '../fixture/user';

describe('e2e', () => {
  var user1;
  var user2;

  var schema;

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

  describe('singular query', () => {
    it('should get data from database by _id', function* () {
      var result = yield graphql(schema, `{
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
  });

  describe('plural query', () => {
    it('should get data from database and filter by number', function* () {
      var result = yield graphql(schema, `{
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
      var result = yield graphql(schema, `{
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
