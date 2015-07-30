import {expect} from 'chai';

import {getSchema} from './schema';
import User from '../fixture/user';

describe('schema', () => {
  let schema = getSchema([User]);

  it('should exist', () => {
    expect(schema).to.be.not.undefined;
  });

  it('should generate schema properly');
});
