const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Storage untuk report images
const reportStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/tmp'); // Gunakan folder sementara di Vercel
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const fileName = crypto.randomBytes(16).toString('hex') + ext;
        cb(null, fileName);
    }
});

// Storage untuk profile images
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/tmp'); // Gunakan folder sementara di Vercel
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const fileName = crypto.randomBytes(16).toString('hex') + ext;
        cb(null, fileName);
    }
});

// File filter
const fileFilter = function (req, file, cb) {
    const allowedTypes = ['.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname);
    if (!allowedTypes.includes(ext.toLowerCase())) {
        return cb(new Error('Invalid Image Type'));
    }
    cb(null, true);
};

// Upload configurations
const limits = { fileSize: 5000000 };  

const uploadReportImage = multer({
    storage: reportStorage,
    limits: limits,
    fileFilter: fileFilter,
}).array('gambar_pendukung', 5);

const uploadProfileImage = multer({
    storage: profileStorage,
    limits: limits,
    fileFilter: fileFilter,
}).single('image');

module.exports = { uploadReportImage, uploadProfileImage };
