import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  avatar: {
    type: String,
    default: function() {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.username}`;
    },
  },
  bio: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre('save', function(next) {
  if (!this.avatar && this.username) {
    this.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.username}`;
  }
  next();
});

export default mongoose.model('User', UserSchema);
