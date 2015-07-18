import co from 'co';
import mongoose from 'mongoose';
import {graphql} from 'graphql';
import {getSchema} from '../src';

import User from './user';

var schema = getSchema([User]);

mongoose.connect('mongodb://localhost/graphql');

function *run() {
  var query = `{
    user(id: "559645cd1a38532d14349246") {
      name
      friends {
        name
      }
    }
  }`;

  return yield graphql(schema, query);
}

co(run)
  .then((res) => console.log(JSON.stringify(res, false, 2)))
  .catch((err) => console.error(err));
