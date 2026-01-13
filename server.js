const express = require('express');
const env = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const path = require('path');
const helmet = require('helmet');
const expressMongoSanitize = require('express-mongo-sanitize');
const cloudinary = require('cloudinary').v2;

env.config();

const app = express();

// =============================
// CLOUDINARY CONFIG
// =============================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY
});

// =============================
// FINAL CORS FIX (WAJIB)
// =============================
const allowedOrigins = [
  'http://localhost:8081',
  'https://sipraja-capstone.netlify.app'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  res.header('Access-Control-Allow-Credentials', 'true');

  // 🔥 KUNCI CORS (PRE-FLIGHT)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// =============================
// MIDDLEWARE
// =============================
app.use(cookieParser());
app.use(express.json());
app.use(helmet());
app.use(expressMongoSanitize());
app.use(bodyParser.urlencoded({ extended: true }));

// static files (jika ada)
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// =============================
// DATABASE
// =============================
connectDB();

// =============================
// ROUTES
// =============================
const userRouter = require('./routes/userRouter');
const laporanRouter = require('./routes/laporanRouter');
const searchRouter = require('./routes/searchRouter');
const forgetRouter = require('./routes/forgetRouter');

app.use('/api/v1/user', userRouter);
app.use('/api/v1/laporan', laporanRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/reset', forgetRouter);

// =============================
// EXPORT (WAJIB UNTUK VERCEL)
// =============================
module.exports = app;
