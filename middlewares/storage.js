const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

 const reportStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const fileName = crypto.randomBytes(16).toString('hex') + ext;
        cb(null, fileName);
    }
});

 const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/profile');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const fileName = crypto.randomBytes(16).toString('hex') + ext;
        cb(null, fileName);
    }
});

 const fileFilter = function (req, file, cb) {
    const allowedTypes = ['.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname);
    if (!allowedTypes.includes(ext.toLowerCase())) {
        return cb(new Error('Invalid Image Type'));
    }
    cb(null, true);
};

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
}).single('image');;

module.exports = { uploadReportImage, uploadProfileImage };
