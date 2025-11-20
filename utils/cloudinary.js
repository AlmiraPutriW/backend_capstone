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
        const withoutParams = url.split('?')[0]; 
        const parts = withoutParams.split('/upload/')[1]; 
        const publicIdWithExt = parts.split('/').slice(1).join('/'); 
        const publicId = publicIdWithExt.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
        return publicId;
    } catch {
        return null;
    }
}

module.exports = { uploadToCloudinary, extractPublicId };
