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
  removed: Boolean
});

var User = mongoose.model('User', UserSchema);

export default User;
