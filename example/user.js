import mongoose from 'mongoose';

var UserSchema = new mongoose.Schema({
  name: {
    type: String
  },
  age: Number,
  createdAt: Date,
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  nums: [Number],
  bools: [Boolean],
  strings: [String],
  removed: Boolean,

  // TODO: support objects
  body: {
    eye: String,
    foot: Number
  },

  // TODO: support sub-documents
  pets: [{
    name: String
  }]
});

var User = mongoose.model('User', UserSchema);

export default User;
