# ![graffiti](https://cloud.githubusercontent.com/assets/1764512/8900273/9ed758dc-343e-11e5-95ba-e82f876cf52d.png) Mongoose

[![npm version](https://badge.fury.io/js/%40risingstack%2Fgraffiti-mongoose.svg)](https://badge.fury.io/js/%40risingstack%2Fgraffiti-mongoose)
[![CircleCI](https://circleci.com/gh/RisingStack/graffiti-mongoose.svg?style=svg)](https://circleci.com/gh/RisingStack/graffiti-mongoose)
[![bitHound Overall Score](https://www.bithound.io/github/RisingStack/graffiti-mongoose/badges/score.svg)](https://www.bithound.io/github/RisingStack/graffiti-mongoose)
[![Known Vulnerabilities](https://snyk.io/test/npm/@risingstack/graffiti-mongoose/badge.svg)](https://snyk.io/test/npm/@risingstack/graffiti-mongoose)

[Mongoose](http://mongoosejs.com) (MongoDB) adapter for [GraphQL](https://github.com/graphql/graphql-js).

`graffiti-mongoose` generates `GraphQL` types and schemas from your existing `mongoose` models, that's how simple it is. The generated schema is compatible with [Relay](https://facebook.github.io/relay/).

For quick jump check out the [Usage section](https://github.com/RisingStack/graffiti-mongoose#usage).

## Install

```shell
npm install graphql @risingstack/graffiti-mongoose  --save
```

## Example

Check out the [/example](https://github.com/RisingStack/graffiti-mongoose/tree/master/example) folder.

```shell
cd graffiti-mongoose
npm install # install dependencies in the main folder
cd example
npm install # install dependencies in the example folder
npm start # run the example application and open your browser: http://localhost:8080
```

## Usage

This adapter is written in `ES6` and `ES7` with [Babel](https://babeljs.io) but it's published as transpiled `ES5` JavaScript code to `npm`, which means you don't need `ES7` support in your application to run it.  

__Example queries can be found in the [example folder](https://github.com/RisingStack/graffiti-mongoose/tree/master/example#example-queries).__

##### usual mongoose model(s)
```javascript
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    // field description
    description: 'the full name of the user'
  },
  hiddenField: {
    type: Date,
    default: Date.now,
    // the field is hidden, not available in GraphQL
    hidden: true
  },
  age: {
    type: Number,
    indexed: true
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const User = mongoose.model('User', UserSchema);
export default User;
```

##### graffiti-mongoose
```javascript
import {getSchema} from '@risingstack/graffiti-mongoose';
import graphql from 'graphql';
import User from './User';

const options = {
  mutation: false, // mutation fields can be disabled
  allowMongoIDMutation: false // mutation of mongo _id can be enabled
};
const schema = getSchema([User], options);

const query = `{
    users(age: 28) {
      name
      friends(first: 2) {
        edges {
          cursor
          node {
            name
            age
          }
        }
        pageInfo {
          startCursor
          endCursor
          hasPreviousPage
          hasNextPage
        }
      }
    }
  }`;

graphql(schema, query)
  .then((result) => {
    console.log(result);
  });
```

## Supported mongoose types

* Number
* String
* Boolean
* Date
* [Number]
* [String]
* [Boolean]
* [Date]
* ObjectId with ref (reference to other document, populate)

## Supported query types

* query
  * singular: for example `user`
  * plural: for example `users`
  * [node](https://facebook.github.io/relay/docs/graphql-object-identification.html): takes a single argument, a unique `!ID`, and returns a `Node`
  * viewer: singular and plural queries as fields

## Supported query arguments

* indexed fields
* "id" on singular type
* array of "id"s on plural type

Which means, you are able to filter like below, if the age is indexed in your mongoose model:

```
users(age: 19) {}
user(id: "mongoId1") {}
user(id: "relayId") {}
users(id: ["mongoId", "mongoId2"]) {}
users(id: ["relayId1", "relayId2"]) {}
```

## Supported mutation types

* mutation
  * addX: for example `addUser`
  * updateX: for example `updateUser`
  * deleteX: for example `deleteUser`

## Supported mutation arguments

* scalar types
* arrays
* references

Examples:
```
mutation addX {
  addUser(input: {name: "X", age: 11, clientMutationId: "1"}) {
    changedUserEdge {
      node {
        id
        name
      }
    }
  }
}
```

```
mutation updateX {
  updateUser(input: {id: "id=", age: 10, clientMutationId: "2"}) {
    changedUser {
      id
      name
      age
    }
  }
}
```

```
mutation deleteX {
  deleteUser(input: {id: "id=", clientMutationId: "3"}) {
    ok
  }
}
```

## Resolve hooks

You can specify pre- and post-resolve hooks on fields in order to manipulate arguments and data passed in to the database resolve function, and returned by the GraphQL resolve function.

You can add hooks to type fields and query fields (singular & plural queries, mutations) too.
By passing arguments to the `next` function, you can modify the parameters of the next hook or the return value of the `resolve` function.

Examples:
- Query, mutation hooks (`viewer`, `singular`, `plural`, `mutation`)
```javascript
const hooks = {
  viewer: {
    pre: (next, root, args, request) => {
      // authorize the logged in user based on the request
      authorize(request);
      next();
    },
    post: (next, value) => {
      console.log(value);
      next();
    }
  },
  // singular: {
  //   pre: (next, root, args, context) => next(),
  //   post: (next, value, args, context) => next()
  // },
  // plural: {
  //   pre: (next, root, args, context) => next(),
  //   post: (next, value, args, context) => next()
  // },
  // mutation: {
  //   pre: (next, args, context) => next(),
  //   post: (next, value, args, context) => next()
  // }
};
const schema = getSchema([User], {hooks});
```

- Field hooks
```javascript
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    hooks: {
      pre: (next, root, args, request) => {
        // authorize the logged in user based on the request
        // throws error if the user has no right to request the user names
        authorize(request);
        next();
      },
      // manipulate response
      post: [
        (next, name) => next(`${name} first hook`),
        (next, name) => next(`${name} & second hook`)
      ]
    }
  }
});
```
```
query UsersQuery {
  viewer {
    users(first: 1) {
      edges {
        node {
          name
        }
      }
    }
  }
}
```
```json
{
  "data": {
    "viewer": {
      "users": {
        "edges": [
          {
            "node": {
              "name": "User0 first hook & second hook"
            }
          }
        ]
      }
    }
  }
}
```

## Test

```shell
npm test
```

## Contributing

Please read the [CONTRIBUTING.md](https://github.com/RisingStack/graffiti-mongoose/tree/master/.github/CONTRIBUTING.md) file.

## License

[MIT](https://github.com/RisingStack/graffiti-mongoose/tree/master/LICENSE)
