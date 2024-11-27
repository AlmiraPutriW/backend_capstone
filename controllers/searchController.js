const Laporan = require("../models/laporanModels");

const Search = async (req, res) => {
    try {
        const { laporan } = req.query;  
        if (!laporan) {
            return res.status(400).json({ message: 'Please provide a search keyword' });
        }
        const query = {};
        query.$or = [
            { nama: { $regex: new RegExp(laporan, 'i') } },  
            { lokasi: { $regex: new RegExp(laporan, 'i') } },   
            { judul: { $regex: new RegExp(laporan, 'i') } }, 
            { description: { $regex: new RegExp(laporan, 'i') } },
            { status: { $regex: new RegExp(laporan, 'i') } }  
        ];
 
        const results = await Laporan.find(query);
   
        if (results.length === 0) {
            return res.status(404).json({ message: 'Tidak ditemukan laporan yang sesuai' });
        }
 
        res.status(200).json({ message: 'Search results', data: results });
    } catch (error) {
        console.error('Error searching laporan:', error);
        res.status(500).json({
            message: 'Terjadi kesalahan saat mencari laporan',
            error: error.message,
        });
    }
};

module.exports = Search