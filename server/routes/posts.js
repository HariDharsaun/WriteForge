const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');

// list posts
router.get('/', auth, async (req, res) => {
  const posts = await Post.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json(posts);
});

// get single
router.get('/:id', auth, async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, userId: req.user._id });
  if (!post) return res.status(404).json({ error: 'Not found' });
  res.json(post);
});

// update
router.put('/:id', auth, async (req, res) => {
  const { title, body, category, tags } = req.body;
  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { title, body, category, tags, updatedAt: new Date(), wordCount: body ? body.trim().split(/\s+/).length : undefined },
    { new: true }
  );
  res.json(post);
});

// delete
router.delete('/:id', auth, async (req, res) => {
  await Post.deleteOne({ _id: req.params.id, userId: req.user._id });
  res.json({ success: true });
});

module.exports = router;
