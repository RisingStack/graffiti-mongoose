# graffiti-mongo

MongoDB adapter for [graffiti](https://github.com/RisingStack/graffiti).

## Install

```
npm i @risingstack/graffiti-mongo --save
```

## Usage

```javascript
import mongoose from 'mongoose';
import {graphql} from 'graphql';
import {getSchema} from '@risingstack/graffit-mongo';


var UserSchema = new mongoose.Schema({
  name: {
    type: String
  },
  age: Number
});

var User = mongoose.model('User', UserSchema);

var schema = getSchema([User]);

var query = `{
    user {
      name
      age
    }
  }`;

return yield graphql(schema, query);
```
