import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String
  },
  age: {
    type: Number,
    index: true
  },
  mother: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  objectIds: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  weight: Number, // to test "floatish" numbers
  createdAt: Date,
  removed: Boolean,
  nums: [Number],
  strings: [String],
  bools: [Boolean],
  dates: [Date],
  sub: {
    foo: String,
    nums: [Number],
    subsub: {
      bar: Number
    }
  }
});

const User = mongoose.model('User', UserSchema);

export default User;
