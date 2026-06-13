import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
    maxlength: 500,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coverImage: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    required: true,
    default: '其他',
  },
  tags: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ArticleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Article', ArticleSchema);
