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
        default: ['https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.hops.id%2Funik%2F29410689482%2Fmengenal-kepribadian-dari-foto-profil-di-media-sosial-memajang-foto-artis-korea-ternyata-berarti-ini&psig=AOvVaw0PcC2IOouKKr6u3ssWcRBZ&ust=1733502756845000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCKjSgJSHkYoDFQAAAAAdAAAAABAE'],
    }
});

 

const Laporan = mongoose.model("Laporan", laporanSchema);
module.exports = Laporan;
