const express = require('express');

const router = express.Router();
const {getLaporan, createLaporan, deleteLaporan, getLaporanById, updateLaporan, accLaporan} = require('../controllers/reportControler')
const verifyToken = require('../middlewares/authMiddleware');
const {uploadReportImage} = require('../middlewares/storage'); 
 

router.get('/', verifyToken,  getLaporan);
router.get('/:id', verifyToken, getLaporanById);
router.post('/create',uploadReportImage, verifyToken, createLaporan)
router.delete('/delete/:id', verifyToken, deleteLaporan);
router.put('/:id', uploadReportImage, verifyToken, updateLaporan);
router.put('/acc/:id', verifyToken, accLaporan);



module.exports = router