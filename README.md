# graffiti-mongoose

[![Build Status](https://travis-ci.org/RisingStack/graffiti-mongoose.svg)](https://travis-ci.org/RisingStack/graffiti-mongoose)  

[Mongoose](http://mongoosejs.com) (MongoDB) adapter for the [graffiti](https://github.com/RisingStack/graffiti) [GraphQL](https://github.com/graphql/graphql-js) ORM.  
`graffiti-mongoose` generates `GraphQL` types and schemas from your existing `mongoose` models, that's how simple it is. For more info check out the [Usage section](https://github.com/RisingStack/graffiti-mongoose#graffiti-mongoose).

## Install

```
npm install @risingstack/graffiti-mongoose --save
```

## Example

Check out the [/example](https://github.com/RisingStack/graffiti-mongoose/tree/master/example) folder.

## Usage

This adapter is written in `ES6` with [Babel](https://babeljs.io) but it's published as transpiled `ES5` JavaScript code to `npm`, which means you don't need `ES6` support in your application to run it.  

#### usual mongoose model(s)
```javascript
import mongoose from 'mongoose';

var UserSchema = new mongoose.Schema({
  name: {
    type: String
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

var User = mongoose.model('User', UserSchema);
```

#### graffiti-mongoose
```javascript
import {getSchema, graphql} from '@risingstack/graffit-mongoose';

var schema = getSchema([User]);

var query = `{
    users(age: 28) {
      name
      friends {
        name
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
* more types coming soon...

## Supported query types

* query
  * singular: for example `user`
  * plural: for example `users`

## Supported query arguments

* indexed fields
* "_id" on singular type
* array of "_id" on plural type

Which means, you are able to filter like below, if the age is indexed in your mongoose model:

```
users(age: 19) {}
user(_id: "mongoId1") {}
users(_id: ["mongoId", "mongoId2"]) {}
```

## Test

```
npm test
```

## License

[MIT](https://github.com/RisingStack/graffiti-mongoose/tree/master/LICENSE)
