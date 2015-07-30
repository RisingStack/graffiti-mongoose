import {expect} from 'chai';
import {
  GraphQLString,
  GraphQLFloat
} from 'graphql/type';

import {getArgs, getRootFields} from './query';
import {getModels} from './model';
import {getTypes} from './type';
import User from '../fixture/user';

describe('query', () => {
  let models;
  let types;

  before(() => {
    models = getModels([User]);
    types = getTypes(models);
  });

  it('should get args properly', () => {
    let args = getArgs(types, models);

    expect(args).to.be.eql({
      User: {
        _id: {
          name: '_id',
          type: GraphQLString
        },
        age: {
          type: GraphQLFloat
        }
      }
    });
  });

  it('should get root field properly', () => {
    let rootFields = getRootFields(types, models);

    expect(rootFields).to.containSubset({
      user: {
        args: {
          _id: {},
          age: {}
        }
      },
      users: {
        args: {
          _id: {},
          age: {}
        }
      }
    });
  });
});
