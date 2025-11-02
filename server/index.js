require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connect } = require('./config/db');
const authRoutes = require('./routes/auth');
const generateRoutes = require('./routes/generate');
const postRoutes = require('./routes/posts');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/posts', postRoutes);

const PORT = process.env.PORT || 4000;

connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai_content_generator')
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('DB connect error', err);
  });
