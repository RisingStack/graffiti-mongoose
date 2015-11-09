import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String
  },
  age: {
    type: Number,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

const User = mongoose.model('User', UserSchema);

export default User;
