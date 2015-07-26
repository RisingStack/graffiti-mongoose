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

    it('should get data with primitive fields');
    it('should get data with array of primitives fields');
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
