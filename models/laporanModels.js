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
    gambar_pendukung: [String],
    isArchived: { 
        type: Boolean,
        default: false,
    }, userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
},
{
    timestamps: true
});


 

const Laporan = mongoose.model("Laporan", laporanSchema);
module.exports = Laporan;
