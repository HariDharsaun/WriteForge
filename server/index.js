require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connect } = require('./config/db');
const authRoutes = require('./routes/auth');
const generateRoutes = require('./routes/generate');
const postRoutes = require('./routes/posts');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4000',
  'write-forge-ten.vercel.app',
  'https://writeforge-ruf6.onrender.com'
]

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow server-to-server or curl
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS policy: Origin ${origin} not allowed`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // allow cookies/auth headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
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
