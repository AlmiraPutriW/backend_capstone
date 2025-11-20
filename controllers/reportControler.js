const Laporan = require('../models/laporanModels');
const fs  = require('fs');
const path  = require('path');
const verifyRole = require('../middlewares/verifyRole');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier')
const { uploadToCloudinary, extractPublicId } = require('../utils/cloudinary');
// =====================================
// GET SEMUA LAPORAN
// =====================================
const getLaporan = async (req, res) => {
    try {
        const laporan = await Laporan.find();
        res.status(200).json({ message: laporan });
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
    }
};

// =====================================
// GET LAPORAN BY ID
// =====================================
const getLaporanById = async (req, res) => {
    try {
        const laporan = await Laporan.findById(req.params.id);

        if (!laporan) {
            return res.status(404).json({ message: 'Laporan tidak ditemukan' });
        }

        res.status(200).json({ message: 'Laporan berhasil diambil', laporan });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil laporan', error: error.message });
    }
};

// =====================================
// CREATE LAPORAN (UPLOAD CLOUDINARY)
// =====================================
const createLaporan = async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
    }

    try {
        const { nama, tanggal, judul, lokasi, kategori, description } = req.body;

        const userId = req.userId;
        if (!userId) return res.status(400).json({ message: 'User ID tidak ditemukan' });

        // Upload semua gambar ke Cloudinary
        const gambarPaths = await Promise.all(
            req.files.map(file => uploadToCloudinary(file.buffer, 'laporan'))
        );

        const newLaporan = new Laporan({
            userId,
            nama,
            tanggal,
            judul,
            lokasi,
            kategori,
            description,
            gambar_pendukung: gambarPaths
        });

        await newLaporan.save();

        res.status(201).json({
            message: 'Laporan berhasil dibuat',
            laporan: newLaporan
        });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan saat membuat laporan', error: error.message });
    }
};

// =====================================
// UPDATE LAPORAN
// =====================================
const updateLaporan = async (req, res) => {
    try {
        const laporan = await Laporan.findById(req.params.id);
        if (!laporan) {
            return res.status(404).json({ message: 'Laporan tidak ditemukan' });
        }

        const { nama, tanggal, judul, lokasi, kategori, description } = req.body;

        let gambarPaths = laporan.gambar_pendukung;

        // Jika ada gambar baru → hapus yang lama, upload baru
        if (req.files && req.files.length > 0) {

            // Hapus gambar lama dari Cloudinary
            await Promise.all(
                laporan.gambar_pendukung.map(async (url) => {
                    const publicId = extractPublicId(url);
                    await cloudinary.uploader.destroy(publicId);
                })
            );

            // Upload gambar baru
            gambarPaths = await Promise.all(
                req.files.map(file => uploadToCloudinary(file.buffer, 'laporan'))
            );
        }

        const updated = await Laporan.findByIdAndUpdate(
            req.params.id,
            { nama, tanggal, judul, lokasi, kategori, description, gambar_pendukung: gambarPaths },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: 'Laporan berhasil diperbarui', laporan: updated });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui laporan', error: error.message });
    }
};

// =====================================
// DELETE LAPORAN
// =====================================
const deleteLaporan = async (req, res) => {
    try {
        const laporan = await Laporan.findById(req.params.id);
        if (!laporan) {
            return res.status(404).json({ message: 'Laporan tidak ditemukan' });
        }

        // Hapus semua gambar Cloudinary
        await Promise.all(
            laporan.gambar_pendukung.map(async (url) => {
                const publicId = extractPublicId(url);
                await cloudinary.uploader.destroy(publicId);
            })
        );

        await Laporan.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Laporan dan seluruh gambar berhasil dihapus' });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan saat menghapus laporan', error: error.message });
    }
};

// =====================================
// ARSIPKAN
// =====================================
const archiveLaporan = async (req, res) => {
    try {
        const laporan = await Laporan.findByIdAndUpdate(
            req.params.id,
            { isArchived: true },
            { new: true }
        );
        if (!laporan) return res.status(404).json({ message: 'Laporan tidak ditemukan' });

        res.status(200).json({ message: 'Laporan berhasil diarsipkan', laporan });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
    }
};

// =====================================
// UNARCHIVE
// =====================================
const unarchiveLaporan = async (req, res) => {
    try {
        const laporan = await Laporan.findByIdAndUpdate(
            req.params.id,
            { isArchived: false },
            { new: true }
        );
        if (!laporan) return res.status(404).json({ message: 'Laporan tidak ditemukan' });

        res.status(200).json({ message: 'Laporan berhasil dibatalkan arsipnya', laporan });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
    }
};

// =====================================
// ACC LAPORAN
// =====================================
const accLaporan = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access Denied' });
    }

    try {
        const laporan = await Laporan.findById(req.params.id);
        if (!laporan) {
            return res.status(404).json({ message: 'Laporan tidak ditemukan' });
        }

        laporan.status = req.body.status;
        const updated = await laporan.save();

        res.status(200).json({ message: 'Laporan berhasil diperbarui', updated });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
    }
};

module.exports = {
    getLaporan,
    getLaporanById,
    createLaporan,
    updateLaporan,
    deleteLaporan,
    accLaporan,
    archiveLaporan,
    unarchiveLaporan
};
