const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Gunakan memoryStorage untuk menyimpan file di buffer
const memoryStorage = multer.memoryStorage();

// File filter untuk memvalidasi tipe file
const fileFilter = function (req, file, cb) {
    const allowedTypes = ['.png', '.jpg', '.jpeg'];
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(`.${ext}`)) {
        return cb(new Error('Invalid file type. Only PNG, JPG, and JPEG are allowed.'));
    }
    cb(null, true);
};

// Batas ukuran file
const limits = { fileSize: 5000000 }; // Maksimal 5MB

// Konfigurasi untuk unggah gambar laporan
const uploadReportImage = multer({
    storage: memoryStorage, // Simpan di memori
    limits: limits,
    fileFilter: fileFilter,
}).array('gambar_pendukung', 5); // Maksimal 5 file

// Konfigurasi untuk unggah gambar profil
const uploadProfileImage = multer({
    storage: memoryStorage, // Simpan di memori
    limits: limits,
    fileFilter: fileFilter,
}).single('image'); // Hanya satu file

module.exports = { uploadReportImage, uploadProfileImage };
