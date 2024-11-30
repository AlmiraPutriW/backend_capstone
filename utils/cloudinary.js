const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier')

// Fungsi utilitas untuk upload ke Cloudinary
async function uploadToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url); // Kembalikan URL gambar
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
}

// Fungsi untuk mengambil `public_id` dari URL
function extractPublicId(url) {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.split('.')[0]; // Mengambil nama file tanpa ekstensi
}

module.exports = { uploadToCloudinary, extractPublicId };
