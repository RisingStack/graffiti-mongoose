import koa from 'koa';
import mongoose from 'mongoose';
import graffiti from '@risingstack/graffiti';
import {getSchema} from '../src';

import User from './user';

const port = process.env.PORT || 8080;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/graphql');

// Generate sample data
User.remove().then(() => {
  const users = [];
  for (let i = 0; i < 100; i++) {
    users.push(new User({
      name: `User${i}`,
      age: i,
      createdAt: new Date() + i * 100,
      friends: users.map((i) => i._id),
      nums: [0, i],
      bools: [true, false],
      strings: ['foo', 'bar'],
      removed: false,
      body: {
        eye: 'blue',
        hair: 'yellow'
      }
    }));
  }
  User.create(users);
});

const hooks = {
  viewer: {
    pre: (next, root, args, {rootValue}) => {
      const {request} = rootValue;
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

// Set up example server
const app = koa();

// attach graffiti-mongoose middleware
app.use(graffiti.koa({
  schema
}));

// redirect all requests to /graphql
app.use(function *redirect() {
  this.redirect('/graphql');
});

app.listen(port);

console.log(`Started on http://localhost:${port}/`); // eslint-disable-line
