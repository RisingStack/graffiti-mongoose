import {expect} from 'chai';
import {
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLList
} from 'graphql/type';

import User from '../fixture/user';
import {get} from './field';

var projection =  require('./projection');

describe('field', () => {
  it('should resolve String properly', () => {
    var field = get({
      instance: 'String'
    });

    expect(field).to.be.eql({
      type: GraphQLString
    });
  });

  it('should resolve Number properly', () => {
    var field = get({
      instance: 'Number'
    });

    expect(field).to.be.eql({
      type: GraphQLFloat
    });
  });

  it('should resolve Boolean properly', () => {
    var field = get({
      instance: 'Boolean'
    });

    expect(field).to.be.eql({
      type: GraphQLBoolean
    });
  });

  it('should resolve Date properly', () => {
    var field = get({
      instance: 'Date'
    });

    var result = field.resolve({
      value: new Date(1438273470215)
    }, undefined, undefined, {
      name: {
        value: 'value'
      }
    });

    expect(field).to.containSubset({
      type: GraphQLString
    });

    expect(result).to.be.equal('2015-07-30T16:24:30.215Z');
  });

  it('should resolve Array of ObjectId properly', function* () {
    var users = [
      new User(),
      new User()
    ];

    this.sandbox.stub(projection, 'getProjection').returns({
      name: 1
    });
    var findStub = this.sandbox.stub(User, 'find').returnsWithResolve(users);

    var field = get({
      instance: 'Array',
      path: 'value',
      caster: {
        instance: 'ObjectID',
        options: {
          ref: 'User'
        }
      }
    }, {
      User: 'foo'
    }, [User]);

    var result = yield field.resolve({
      value: [users[0]._id, users[1]._id]
    }, undefined, undefined, {
      name: {
        value: 'value'
      }
    });

    expect(findStub).to.calledWith({
      _id: {
        $in: [users[0]._id.toString(), users[1]._id.toString()]
      }
    }, {
      name: 1
    });

    expect(result).to.be.eql(users);

    expect(field).to.containSubset({
      type: new GraphQLList('foo')
    });
  });

  it('should resolve Array of String properly', () => {
    var field = get({
      instance: 'Array',
      caster: {
        instance: 'String'
      }
    });

    expect(field).to.be.eql({
      type: new GraphQLList(GraphQLString)
    });
  });

  it('should resolve Array of Number properly', () => {
    var field = get({
      instance: 'Array',
      caster: {
        instance: 'Number'
      }
    });

    expect(field).to.be.eql({
      type: new GraphQLList(GraphQLFloat)
    });
  });

  it('should resolve Array of Boolean properly', () => {
    var field = get({
      instance: 'Array',
      caster: {
        instance: 'Boolean'
      }
    });

    expect(field).to.be.eql({
      type: new GraphQLList(GraphQLBoolean)
    });
  });

  it('should resolve Array of Dates properly', () => {
    var field = get({
      instance: 'Array',
      caster: {
        instance: 'Date'
      }
    });

    var result = field.resolve({
      value: [new Date(0), new Date(1438273470215)]
    }, undefined, undefined, {
      name: {
        value: 'value'
      }
    });

    expect(result).to.be.eql(['1970-01-01T00:00:00.000Z', '2015-07-30T16:24:30.215Z']);

    expect(field).to.containSubset({
      type: new GraphQLList(GraphQLString)
    });
  });
});
