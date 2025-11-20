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

function extractPublicId(url) {
    try {
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');

        if (uploadIndex === -1) return null;

        // Ambil path setelah "/upload/"
        const publicIdPath = parts.slice(uploadIndex + 1).join('/');

        // Hilangkan ekstensi file (.jpg, .png, dll)
        return publicIdPath.replace(/\.[^/.]+$/, ''); 
    } catch (err) {
        return null;
    }
}


module.exports = { uploadToCloudinary, extractPublicId };
