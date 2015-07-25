import {expect} from 'chai';
import mongoose from 'mongoose';
import {getSchema} from './schema';

describe('schema', () => {
  it('should generate schema for model', () => {
    var UserSchema = new mongoose.Schema({
      name: {
        type: String
      },
      age: Number
    });

    var User = mongoose.model('User', UserSchema);

    var schema = getSchema([User]);

    expect(schema).to.be.not.null;
  });
});
