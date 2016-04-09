import koa from 'koa';
import parser from 'koa-bodyparser';
import mongoose from 'mongoose';
import graffiti from '@risingstack/graffiti';
import {getSchema} from '../src';

import User from './user';

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/graphql');
const port = process.env.PORT || 8080;

const hooks = {
  viewer: {
    pre: (next, root, args, request) => {
      console.log(request);
      next();
    },
    post: (next, value) => {
      console.log(value);
      next();
    }
  }
};
const schema = getSchema([User], {hooks});

// set up example server
const app = koa();

// parse body
app.use(parser());

// attach graffiti-mongoose middleware
app.use(graffiti.koa({
  schema
}));

// redirect all requests to /graphql
app.use(function *redirect() {
  this.redirect('/graphql');
});

app.listen(port);

console.log(`Started on http://localhost:${port}/`);
