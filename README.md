# graffiti-mongoose

[Mongoose](http://mongoosejs.com) (MongoDB) adapter for [graffiti](https://github.com/RisingStack/graffiti).

## Install

```
npm i @risingstack/graffiti-mongoose --save
```

## Usage

```javascript
import mongoose from 'mongoose';
import {graphql} from 'graphql';
import {getSchema} from '@risingstack/graffit-mongoose';

var UserSchema = new mongoose.Schema({
  name: {
    type: String
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

var User = mongoose.model('User', UserSchema);

var schema = getSchema([User]);

var query = `{
    users {
      name
      friends {
        name
      }
    }
  }`;

return yield graphql(schema, query);
```
