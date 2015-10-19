import koa from 'koa';
import serve from 'koa-static';
import mongoose from 'mongoose';
import graffiti from '@risingstack/graffiti';
import graffitiMongoose from '../src';

import User from './user';

const port = process.env.PORT || 8080;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/graphql');

// Generate sample data
User.remove();
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

// Set up example server
const app = koa();

// attach graffiti-mongoose middleware
app.use(graffiti.koa({
  prefix: '/graphql',
  adapter: graffitiMongoose,
  models: [User]
}));

app.use(serve(__dirname + '/dist'));

app.listen(port);

console.log(`Started on http://localhost:${port}/`); // eslint-disable-line
