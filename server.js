const express = require('express');
const env = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
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
// CORS FIX — SUPPORT MULTIPLE ORIGIN
// =============================
const allowedOrigins = [
  'http://localhost:8081',
  'https://sipraja-capstone.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Jika request tidak ada origin (misalnya Postman) = izinkan
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // izinkan cookie/token lintas domain
}));

// =============================
// OTHER MIDDLEWARE
// =============================
app.use(cookieParser());
app.use(express.json());
app.use(helmet());
app.use(expressMongoSanitize());
app.use(bodyParser.urlencoded({ extended: true }));

// untuk akses gambar dari backend (jika ada)
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// =============================
// CONNECT DATABASE
// =============================
connectDB();

// =============================
// ROUTERS
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
// START SERVER
// =============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
