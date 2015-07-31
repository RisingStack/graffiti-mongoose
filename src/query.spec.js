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
          type: GraphQLString,
          description: '"_id" field of the "${mode.name}" model with type "String"'
        },
        age: {
          type: GraphQLFloat,
          name: 'age',
          description: '"age" field of the "User" model with type "Number"'
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
