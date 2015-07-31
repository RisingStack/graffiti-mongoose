import {expect} from 'chai';
import {getTypes} from './type';
import {GraphQLString} from 'graphql/type';

var field = require('./field');

describe('type', () => {
  it('should get types for grffiti model properly', function() {
    this.sandbox.stub(field, 'getField').returns({
      type: GraphQLString
    });

    let models = [{
      name: 'Foo',
      fields: [{
        name: 'aa',
        path: 'aa',
        instance: 'String'
      }, {
        name: 'bb',
        path: 'bb',
        instance: 'String'
      }]
    }];

    let types = getTypes(models);

    expect(types).to.be.eql({
      Foo: {
        _interfaces: [],
        _typeConfig: {
          fields: {
            aa: {
              type: GraphQLString
            },
            bb: {
              type: GraphQLString
            }
          },
          name: 'Foo'
        },
        description: undefined,
        name: 'Foo'
      }
    });
  });
});
