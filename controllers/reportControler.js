const Laporan = require('../models/laporanModels');
const fs  = require('fs');
const path  = require('path');
const verifyRole = require('../middlewares/verifyRole');

const getLaporan = async (req, res) => {
    const laporan = await Laporan.find()
    try {
        res.status(200).json({ message: laporan });
        
    } catch (err) {
        res.status(500).json({ message : err.message });
        
    }
}

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
        const { nama, judul, lokasi, kategori, description } = req.body;
        const gambarPaths = req.files.map(file => `/images/${path.basename(file.path)}`);
 
        const newLaporan = new Laporan({
            nama,
            judul,
            lokasi,
            kategori,
            description,
            gambar_pendukung: gambarPaths
        });

        await newLaporan.save();
        res.status(201).json({ message: 'Laporan berhasil dibuat', laporan: newLaporan });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan saat membuat laporan', error: error.message });
    }
};

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
             if (existingLaporan.gambar_pendukung && existingLaporan.gambar_pendukung.length > 0) {
                existingLaporan.gambar_pendukung.forEach(oldPath => {
                    const filePath = path.join(__dirname, '..', 'public', oldPath); 
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath); 
                    }
                });
            }
           
            gambarPaths = req.files.map(file => `/images/${path.basename(file.path)}`);
        }

         const updatedLaporan = await Laporan.findByIdAndUpdate(
            id,
            { nama, judul, lokasi, kategori, description, gambar_pendukung: gambarPaths },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: 'Laporan berhasil diperbarui',
            laporan: updatedLaporan
        });
    } catch (error) {
         res.status(500).json({
            message: 'Terjadi kesalahan saat memperbarui laporan',
            error: error.message
        });
    }
};


const deleteLaporan = async (req, res) => {
    const { id } = req.params;

    try {
  
        const laporan = await Laporan.findById(id);
        if (!laporan) {
            return res.status(404).json({ message: 'Laporan tidak ditemukan' });
        }

  
        if (laporan.gambar_pendukung && laporan.gambar_pendukung.length > 0) {
            laporan.gambar_pendukung.forEach(filePath => {
                const fullPath = path.join(__dirname, '..', 'public', filePath);  
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);  
                }
            });
        }

 
        await Laporan.findByIdAndDelete(id);

        res.status(200).json({
            message: 'Laporan dan gambar terkait berhasil dihapus'
        });
    } catch (error) {
        console.error('Error deleting laporan:', error);
        res.status(500).json({
            message: 'Terjadi kesalahan saat menghapus laporan',
            error: error.message
        });
    }
};

const accLaporan = async (req, res) => {
    
    const verifyRole = req.user.role;
    if(verifyRole !== "admin"){
        res.status(403).json({message: 'Access Danied'});
    }
    try {
        const { id } = req.params;
        const { status } = req.body;

         const data = await Laporan.findById(id);
        
        if (!data) {
            return res.status(404).json({ message: "Laporan not found" });
        }

         data.status = status;
            console.log(status)
         const updatedLaporan = await data.save();

        res.status(200).json({ message: "Laporan updated successfully", updatedLaporan });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred", error });
    }
};


module.exports = {
    getLaporan,
    getLaporanById,
    createLaporan,
    deleteLaporan,
    updateLaporan,
    accLaporan
}

