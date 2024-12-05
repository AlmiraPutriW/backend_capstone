const mongoose = require('mongoose');
const { Schema } = mongoose;

const laporanSchema = new Schema({
    nama: {
        type: String,
        required: true
    },
    tanggal: {
        type: String,
    },
    judul: {
        type: String,
        required: true
    },
    lokasi: {
        type: String,
        required: true
    },
    kategori: {
        type: String,
    },
    status: {
        type: String,
        enum: ['belum di proses', 'di proses', 'selesai'], 
        default: 'belum di proses'
    },
    description: {
        type: String,
        required: true
    },
    gambar_pendukung: {
        type: [String],
    }
});

 

const Laporan = mongoose.model("Laporan", laporanSchema);
module.exports = Laporan;
