const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Upload buffer ke Cloudinary
async function uploadToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    console.log("CLOUDINARY RESULT:", result.secure_url);
                    resolve(result.secure_url);
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
}

// Extract public_id lengkap (folder/publicId)
function extractPublicId(url) {
    // Contoh URL Cloudinary:
    // https://res.cloudinary.com/<cloud>/image/upload/v123456/laporan/abc123.png

    const parts = url.split('/');

    // cari posisi "v12345"
    const versionIndex = parts.findIndex(p => p.startsWith('v'));

    // ambil path setelah versi → laporan/abc123.png
    const filePath = parts.slice(versionIndex + 1).join('/');

    // hapus ekstensi → laporan/abc123
    return filePath.split('.')[0];
}

module.exports = { uploadToCloudinary, extractPublicId };
