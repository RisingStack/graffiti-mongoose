import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String
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
  removed: Boolean,

  body: {
    eye: String,
    hair: Number
  }
});

const User = mongoose.model('User', UserSchema);

export default User;
