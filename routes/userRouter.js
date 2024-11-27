const express  = require('express');
const router = express.Router()
const {Login, Register, Logout, Distroy, updateProfile, getAllUser, updatePassword, getUserId} = require('../controllers/userController')
const verifyToken = require('../middlewares/authMiddleware');
const {uploadProfileImage} = require('../middlewares/storage'); 


router.get('/',  getAllUser);
router.get('/login', Login);
router.get('/:id',verifyToken, getUserId);
router.post('/register', Register);
router.post('/logout', verifyToken, Logout);
router.delete('/distroy/:id', verifyToken,Distroy);
router.put('/profile/:id',uploadProfileImage,  verifyToken,  updateProfile);
router.put('/password/:id', verifyToken,  updatePassword);


module.exports = router