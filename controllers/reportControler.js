const Laporan = require('../models/laporanModels');
const fs  = require('fs');
const path  = require('path');
const verifyRole = require('../middlewares/verifyRole');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier')
const { uploadToCloudinary, extractPublicId } = require('../utils/cloudinary');

// Ambil semua laporan
const getLaporan = async (req, res) => {
    try {
        const laporan = await Laporan.find();
        res.status(200).json({ message: laporan });
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
    }
};

// Ambil laporan berdasarkan ID
const getLaporanById = async (req, res) => {
    try {
        const { id } = req.params;
        const laporan = await Laporan.findById(id);

        if (!laporan) {
            return res.status(404).json({ message: 'Laporan tidak ditemukan' });
        }

        res.status(200).json({ message: 'Laporan berhasil diambil', laporan });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil laporan', error: error.message });
    }
};

// Buat laporan baru
const createLaporan = async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }

    try {
        const { nama, judul, lokasi, kategori, description } = req.body;

        // Unggah gambar ke Cloudinary
        const gambarPaths = await Promise.all(
            req.files.map(file => uploadToCloudinary(file.buffer, 'laporan'))
        );

        const newLaporan = new Laporan({
            nama,
            judul,
            lokasi,
            kategori,
            description,
            gambar_pendukung: gambarPaths,
        });

        await newLaporan.save();
        res.status(201).json({ message: 'Laporan berhasil dibuat', laporan: newLaporan });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan saat membuat laporan', error: error.message });
    }
};

// Perbarui laporan
const updateLaporan = async (req, res) => {
    const { id } = req.params;

    try {
        const { nama, judul, lokasi, kategori, description } = req.body;
        const existingLaporan = await Laporan.findById(id);

        if (!existingLaporan) {
            return res.status(404).json({ message: 'Laporan tidak ditemukan' });
        }

        let gambarPaths = existingLaporan.gambar_pendukung;

        if (req.files && req.files.length > 0) {
            // Hapus gambar lama dari Cloudinary
            await Promise.all(
                existingLaporan.gambar_pendukung.map(async url => {
                    const publicId = extractPublicId(url);
                    await cloudinary.uploader.destroy(`laporan/${publicId}`);
                })
            );

            // Unggah gambar baru ke Cloudinary
            gambarPaths = await Promise.all(
                req.files.map(file => uploadToCloudinary(file.buffer, 'laporan'))
            );
        }

        const updatedLaporan = await Laporan.findByIdAndUpdate(
            id,
            { nama, judul, lokasi, kategori, description, gambar_pendukung: gambarPaths },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: 'Laporan berhasil diperbarui', laporan: updatedLaporan });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui laporan', error: error.message });
    }
};

// Hapus laporan
const deleteLaporan = async (req, res) => {
    const { id } = req.params;

    try {
        const laporan = await Laporan.findById(id);
        if (!laporan) {
            return res.status(404).json({ message: 'Laporan tidak ditemukan' });
        }

        // Hapus gambar dari Cloudinary
        await Promise.all(
            laporan.gambar_pendukung.map(async url => {
                const publicId = extractPublicId(url);
                await cloudinary.uploader.destroy(`laporan/${publicId}`);
            })
        );

        // Hapus laporan dari database
        await Laporan.findByIdAndDelete(id);

        res.status(200).json({ message: 'Laporan dan gambar terkait berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan saat menghapus laporan', error: error.message });
    }
};

// Approve laporan
const accLaporan = async (req, res) => {
    const verifyRole = req.user.role;
    if (verifyRole !== 'admin') {
        return res.status(403).json({ message: 'Access Denied' });
    }

    try {
        const { id } = req.params;
        const { status } = req.body;

        const data = await Laporan.findById(id);
        if (!data) {
            return res.status(404).json({ message: 'Laporan tidak ditemukan' });
        }

        data.status = status;
        const updatedLaporan = await data.save();

        res.status(200).json({ message: 'Laporan berhasil diperbarui', updatedLaporan });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
    }
};

module.exports = {
    getLaporan,
    getLaporanById,
    createLaporan,
    deleteLaporan,
    updateLaporan,
    accLaporan,
};
