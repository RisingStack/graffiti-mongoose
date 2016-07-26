## Overview of the Issue

Give a short description of the issue.

```javascript
If an error was thrown, paste here the stack trace.
```

## Reproduce the Error

Provide an unambiguous set of steps, input schema, Node version, package version, etc.

Steps to reproduce:
1. step
2. step
3. step

Input schema(s):
```javascript
// for example
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    nonNull: true
  },
  age: {
    type: Number,
    index: true
  },
  createdAt: Date,
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  nums: [Number],
  bools: [Boolean],
  strings: [String],
  removed: Boolean
});
```

Node version: `4.4.7`
Graffiti-Mongoose version: `5.2.0`

## Related Issues

Has a similar issue been reported before?

## Suggest a Fix

If you can't fix the bug yourself, perhaps you can point to what might be causing the problem (line of code or commit)

### Thank you for your contribution!
