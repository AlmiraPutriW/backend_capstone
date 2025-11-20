const express = require('express');
const env = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const helmet = require('helmet')
const expressMongoSanitize = require('express-mongo-sanitize')
const cloudinary = require('cloudinary').v2;

env.config();

const app = express();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

// ==== CORS FIX ====
const allowedOrigins = [
  'http://localhost:8081',
  'https://sipraja-capstone.netlify.app'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

app.use(cookieParser());
app.use(express.json());
app.use(helmet());
app.use(expressMongoSanitize());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Connect to the database
connectDB();

// Routers
const userRouter = require('./routes/userRouter');
const laporanRouter = require('./routes/laporanRouter');
const searchRouter = require('./routes/searchRouter');
const forgetRouter = require('./routes/forgetRouter');

// Use routers
app.use('/api/v1/user', userRouter);
app.use('/api/v1/laporan', laporanRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/reset', forgetRouter);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
