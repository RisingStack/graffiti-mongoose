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
      age: {
        type: Number,
        index: true
      },
      weight: Number, // to test "floatish" numbers
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
      var user = new User();

      var findByIdStub = this.sandbox.stub(User, 'findOne').returnsWithResolve(user);

      var result = yield graphql(schema, `{
        user(_id: "${user._id}") {
          _id
        }
      }`);

      expect(findByIdStub).to.calledWith({
        _id: user._id
      }, {
        _id: 1
      });

      expect(result).to.be.eql({
        data: {
          user: {
            _id: user._id.toString()
          }
        }
      });
    });

    it('should get data by indexed fields', function* () {
      var user = new User({
        name: 'Foo',
        age: 24
      });

      var findByIdStub = this.sandbox.stub(User, 'findOne').returnsWithResolve(user);

      var result = yield graphql(schema, `{
        user(age: 24) {
          name
          age
        }
      }`);

      expect(findByIdStub).to.calledWith({
        age: 24
      }, {
        name: 1,
        age: 1
      });

      expect(result).to.be.eql({
        data: {
          user: {
            name: 'Foo',
            age: 24
          }
        }
      });
    });

    it('should get data with primitive fields', function* () {
      var user = new User({
        name: 'Foo',
        age: 24,
        weight: 64.7,
        removed: false,
        createdAt: new Date(1437911686190)
      });

      this.sandbox.stub(User, 'findOne').returnsWithResolve(user);

      var result = yield graphql(schema, `{
        user(_id: "${user._id}") {
          name
          age
          weight
          createdAt
          removed
        }
      }`);

      expect(result).to.be.eql({
        data: {
          user: {
            name: 'Foo',
            age: 24,
            weight: 64.7,
            createdAt: '2015-07-26T11:54:46.190Z',
            removed: false
          }
        }
      });
    });

    it('should get data with array of primitives fields', function* () {
      var user = new User({
        nums: [1, 2, 3],
        strings: ['a', 'b', 'c'],
        bools: [true, false, true],
        dates: [new Date(1437911686190), new Date(1437911680190)]
      });

      this.sandbox.stub(User, 'findOne').returnsWithResolve(user);

      var result = yield graphql(schema, `{
        user(_id: "${user._id}") {
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

    // TODO: cover sub-documents with unit tests
    it('should get data with sub-document fields');

    it('should get data with ref fields', function* () {
      var user1 = new User({
        name: 'Foo'
      });

      var user2 = new User({
        name: 'Bar',
        friends: [user1._id]
      });

      var findByIdStub = this.sandbox.stub(User, 'findOne').returnsWithResolve(user2);
      var findStub = this.sandbox.stub(User, 'find').returnsWithResolve([user1]);

      var result = yield graphql(schema, `{
        user(_id: "${user2._id}") {
          name
          friends {
            name
          }
        }
      }`);

      expect(findByIdStub).to.calledWith({
        _id: user2._id
      }, {
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

    it('should filter daya by array of _id(s)', function* () {
      var findStub = this.sandbox.stub(User, 'find').returnsWithResolve([]);

      var result = yield graphql(schema, `{
        users(_id: ["aaa", "bbb"]) {
          name
        }
      }`);

      expect(findStub).to.calledWith({
        _id: {
          $in: ['aaa', 'bbb']
        }
      }, {
        name: 1
      })
    });

    // TODO: missing test cases
    it('should filter data by indexed fields');
  });
});
