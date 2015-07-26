import {expect} from 'chai';
import {graphql} from 'graphql';
import mongoose from 'mongoose';
import {getSchema} from './schema';

describe('schema', () => {
  let schema;
  let User;

  before(() => {
    var UserSchema = new mongoose.Schema({
      name: {
        type: String
      },
      age: Number,
      createdAt: Date,
      removed: Boolean,
      nums: [Number],
      strings: [String],
      bools: [Boolean],
      dates: [Date],
      friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    });

    User = mongoose.model('User', UserSchema);

    schema = getSchema([User]);
  });

  it('should exist', () => {
    expect(schema).to.be.not.undefined;
  });

  describe('singular resource', () => {
    it('should get data by id with selected fields', function* () {
      var user = new User({
        name: 'Foo'
      });

      var findByIdStub = this.sandbox.stub(User, 'findById').returnsWithResolve(user);

      var result = yield graphql(schema, `{
        user(id: "aaa") {
          name
        }
      }`);

      expect(findByIdStub).to.calledWith('aaa', {
        name: 1
      });

      expect(result).to.be.eql({
        data: {
          user: {
            name: 'Foo'
          }
        }
      });
    });

    // TODO: missing test cases
    it('should get data by indexed fields');

    it('should get data with primitive fields', function* () {
      this.sandbox.stub(User, 'findById').returnsWithResolve(new User({
        name: 'Foo',
        age: 24,
        removed: false,
        createdAt: new Date(1437911686190)
      }));

      var result = yield graphql(schema, `{
        user(id: "aaa") {
          name
          age
          createdAt
          removed
        }
      }`);

      expect(result).to.be.eql({
        data: {
          user: {
            name: 'Foo',
            age: 24,
            createdAt: '2015-07-26T11:54:46.190Z',
            removed: false
          }
        }
      });
    });

    it('should get data with array of primitives fields', function* () {
      this.sandbox.stub(User, 'findById').returnsWithResolve(new User({
        nums: [1, 2, 3],
        strings: ['a', 'b', 'c'],
        bools: [true, false, true],
        dates: [new Date(1437911686190), new Date(1437911680190)]
      }));

      var result = yield graphql(schema, `{
        user(id: "aaa") {
          nums
          strings
          bools
          dates
        }
      }`);

      expect(result).to.be.eql({
        data: {
          user: {
            nums: [1, 2, 3],
            strings: ['a', 'b', 'c'],
            bools: [true, false, true],
            dates: ['2015-07-26T11:54:46.190Z', '2015-07-26T11:54:40.190Z']
          }
        }
      });
    });

    it('should get data with sub-document fields');

    it('should get data with ref fields', function* () {
      var user1 = new User({
        name: 'Foo'
      });

      var user2 = new User({
        name: 'Bar',
        friends: [user1._id]
      });

      var findByIdStub = this.sandbox.stub(User, 'findById').returnsWithResolve(user2);
      var findStub = this.sandbox.stub(User, 'find').returnsWithResolve([user1]);

      var result = yield graphql(schema, `{
        user(id: "bbb") {
          name
          friends {
            name
          }
        }
      }`);

      expect(findByIdStub).to.calledWith('bbb', {
        name: 1,
        friends: 1
      });

      expect(findStub).to.calledWithMatch({
        _id: {
          $in: [user1._id.toString()]
        }
      }, {
        name: 1
      });

      expect(result).to.be.eql({
        data: {
          user: {
            name: 'Bar',
            friends: [
              {
                name: 'Foo'
              }
            ]
          }
        }
      });
    });
  });

  describe('plural resource', () => {
    it('should get data with selected fields', function* () {
      var user1 = new User({
        name: 'Foo'
      });

      var user2 = new User({
        name: 'Bar'
      });

      this.sandbox.stub(User, 'find').returnsWithResolve([user1, user2]);

      var result = yield graphql(schema, `{
        users {
          name
        }
      }`);

      expect(result).to.be.eql({
        data: {
          users: [
            {
              name: 'Foo'
            }, {
              name: 'Bar'
            }
          ]
        }
      });
    });

    // TODO: missing test cases
    it('should filter data by indexed fields');
  });
});
