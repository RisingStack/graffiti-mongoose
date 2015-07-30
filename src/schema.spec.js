import {expect} from 'chai';

import {getModels} from './model';
import {getSchema} from './schema';
import User from '../fixture/user';

describe('schema', () => {
  let schema = getSchema(getModels([User]));

  it('should exist', () => {
    expect(schema).to.be.not.undefined;
  });

  it('should generate schema properly');
});
