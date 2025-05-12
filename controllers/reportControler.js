const Laporan = require('../models/laporanModels');
const fs  = require('fs');
const path  = require('path');
const verifyRole = require('../middlewares/verifyRole');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier')
const { uploadToCloudinary, extractPublicId } = require('../utils/cloudinary');
const nodemailer = require("nodemailer");
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

const createLaporan = async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }

    try {
        const { nama, tanggal, judul, lokasi, kategori, description } = req.body;

        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID tidak ditemukan. Silakan login ulang.' });
        }

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
        const { nama, tanggal, judul, lokasi, kategori, description } = req.body;
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
            { nama, tanggal, judul, lokasi, kategori, description, gambar_pendukung: gambarPaths },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: 'Laporan berhasil diperbarui', laporan: updatedLaporan });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui laporan', error: error.message });
    }
};

const getUserLaporan = async (req, res) => {
    try {
        // Ambil userId dari request (ditambahkan oleh middleware autentikasi)
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID tidak ditemukan. Silakan login ulang.' });
        }

        // Cari laporan berdasarkan userId
        const laporan = await Laporan.find({ userId });

        if (laporan.length === 0) {
            return res.status(404).json({ message: 'Tidak ada laporan untuk pengguna ini.' });
        }

        res.status(200).json({ message: 'Laporan berhasil diambil', laporan });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil laporan', error: error.message });
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

// Arsipkan laporan
const archiveLaporan = async (req, res) => {
    try {
        const { id } = req.params;

        const laporan = await Laporan.findByIdAndUpdate(
            id,
            { isArchived: true },
            { new: true }
        );

        if (!laporan) {
            return res.status(404).json({ message: 'Laporan tidak ditemukan' });
        }

        res.status(200).json({ message: 'Laporan berhasil diarsipkan', laporan });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan saat mengarsipkan laporan', error: error.message });
    }
};

// Batalkan arsipkan laporan
const unarchiveLaporan = async (req, res) => {
    try {
        const { id } = req.params;

        const laporan = await Laporan.findByIdAndUpdate(
            id,
            { isArchived: false },
            { new: true }
        );

        if (!laporan) {
            return res.status(404).json({ message: 'Laporan tidak ditemukan' });
        }

        res.status(200).json({ message: 'Laporan berhasil dibatalkan arsipnya', laporan });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan saat membatalkan arsip laporan', error: error.message });
    }
};


const sendEmailNotification = async (email, subject, htmlContent) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD_APP_EMAIL,
        },
        tls: {
            rejectUnauthorized: false,
        }
    });

    const mailOptions = {
        from: `"Laporan Infrastruktur" <${process.env.EMAIL}>`,
        to: email,
        subject: subject,
        html: htmlContent,
    };

    return transporter.sendMail(mailOptions);
};

const accLaporan = async (req, res) => {
    try {
        const verifyRole = req.user.role;
        if (verifyRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access Denied' });
        }

        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['belum di proses', 'di proses', 'selesai'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Status tidak valid.' });
        }

        const data = await Laporan.findById(id).populate('userId');
        if (!data) {
            return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });
        }

        data.status = status;
        const updatedLaporan = await data.save();

        const notification = new Notification({
            userId: data.userId._id,
            message: `Laporan Anda dengan judul ${data.judul} telah ${status}. Terima kasih telah melaporkan!`,
        });
        await notification.save();

        res.status(200).json({
            success: true,
            message: 'Laporan berhasil diperbarui.',
            laporan: updatedLaporan
        });

        // Kirim email setelah response
        if (data.userId.email) {
            const subject = `Status Laporan Anda: ${data.judul}`;
            const htmlContent = `
                <p>Halo ${data.userId.nama || 'Pengguna'},</p>
                <p>Laporan Anda dengan judul <strong>${data.judul}</strong> telah <strong>${status}</strong>.</p>
                <p>Terima kasih telah menggunakan layanan pelaporan kami.</p>
            `;

            sendEmailNotification(data.userId.email, subject, htmlContent)
                .then(() => {
                    console.log('Email berhasil dikirim ke', data.userId.email);
                })
                .catch((emailErr) => {
                    console.error('Gagal mengirim email:', emailErr.message);
                });
        } else {
            console.warn('Email user tidak ditemukan, email tidak dikirim.');
        }
    } catch (error) {
        console.error('Error dalam proses accLaporan:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.', error: error.message });
    }
};


module.exports = {
    getLaporan,
    getLaporanById,
    createLaporan,
    deleteLaporan,
    updateLaporan,
    accLaporan,
    archiveLaporan,
    unarchiveLaporan,
    getUserLaporan,
};
