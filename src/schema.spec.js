import {expect} from 'chai';
import ObjectID from 'bson-objectid';
import {graphql} from 'graphql';

import {get} from './schema';
import User from '../fixture/user';

describe('schema', () => {
  let schema = get([User]);

  it('should exist', () => {
    expect(schema).to.be.not.undefined;
  });

  it('should generate schema properly');
});
