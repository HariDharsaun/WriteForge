const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  body: String,
  category: String,
  tags: [String],
  wordCount: Number,
  prompt: String,
  modelUsed: String,
  tokensUsed: Number,
  visibility: { type: String, default: 'private' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('Post', PostSchema);
