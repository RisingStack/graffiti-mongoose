import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiSubset from 'chai-subset';

import mongoose from 'mongoose';

before((done) => {
  chai.use(sinonChai);
  chai.use(chaiSubset);

  mongoose.Promise = global.Promise;

  mongoose.connect('mongodb://localhost/graffiti-mongoose-test', () => {
    mongoose.connection.db.dropDatabase(done);
  });

  sinon.stub.returnsWithResolve = function returnsWithResolve(data) {
    return this.returns(Promise.resolve(data));
  };

  sinon.stub.returnsWithReject = function returnsWithReject(error) {
    return this.returns(Promise.reject(error));
  };
});

after((done) => {
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close(() => done());
});

beforeEach(function sandbox() {
  this.sandbox = sinon.sandbox.create();
});

afterEach(function sandbox() {
  this.sandbox.restore();
});
