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

// Generate sample data
User.remove().then(() => {
  const users = [];
  for (let i = 0; i < 100; i++) {
    users.push(new User({
      name: `User${i}`,
      age: i,
      createdAt: new Date() + (i * 100),
      friends: users.map((i) => i._id),
      nums: [0, i],
      bools: [true, false],
      strings: ['foo', 'bar'],
      removed: false,
      body: {
        eye: 'blue',
        hair: 'yellow'
      }
    }));
  }
  User.create(users);
});

export default User;
