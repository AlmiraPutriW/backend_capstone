const bcrypt = require('bcrypt')
const User = require('../models/userModels');
const { generateToken } = require('../utils/tokenUtils');
const path = require('path')
const fs = require('fs')
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier')
const { uploadToCloudinary, extractPublicId } = require('../utils/cloudinary');


const getAllUser = async (req, res) => {
    const data = await User.find()
    try {
       res.status(200).json({message : 'get success', data : data})
        
    } catch (error) {
   res.status(500).json({message : 'failure', error : error.message})
        
    }
};

const getUserId = async (req, res) => {
    const id = req.params.id;
    const data = await User.findById(id)
    try {
       res.status(200).json({message : 'get success', data : data, nama: data.nama, email: data.email, telp: data.telp, image: data.image})
        
    } catch (error) {
   res.status(500).json({message : 'failure', error : error.message})
        
    }
};


const Login = async(req, res) => {
   const {email, password} = req.body;

   try {
      const user = await User.findOne({email});
      if(!user){
         return res.status(404).json({message : "email tidak ditemukan"})
      }

      const validationPassword = await bcrypt.compare(password, user.password);
      if(!validationPassword){
         return res.status(400).json({ error: 'Password salah' });
      }

       const token = generateToken(user);

       res.cookie('authToken', token , {
        httpOnly : false,
        secure :  true,
        sameSite : 'None',
       })

        res.status(200).json({ message: 'Login berhasil', data: { userId: user._id}, userId: user._id, token, role: user.role });
   } catch (err) {
      return res.status(500).json({ error: 'Terjadi Kesalahan server' });
      
   }
}

const Register = async (req, res) => {
    const { nama, email, password: plainPassword, confirm_password, telp } = req.body;

    // Cek apakah semua field terisi
    if (!nama || !email || !plainPassword || !confirm_password || !telp) {
        return res.status(400).json({ message: 'Mohon pastikan semua terisi' });
    }

    // Cek apakah password sama dengan confirm_password
    if (plainPassword !== confirm_password) {
        return res.status(400).json({ message: 'Password tidak sama' });
    }

    try {
        // Cek apakah email sudah terdaftar
        const validateEmail = await User.findOne({ email });
        if (validateEmail) {
            return res.status(409).json({ message: 'Email sudah terdaftar' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        // Buat user baru tanpa menyimpan confirm_password
        const post = await User.create({
            nama,
            email,
            password: hashedPassword,
            telp
        });

        res.status(201).json({ message: 'User berhasil dibuat', data: post });
    } catch (err) {
        console.error('Error saat registrasi:', err);
        res.status(500).json({ message: 'Registrasi gagal', error: err.message });
    }
};

const Logout = (req, res) => {
   res.clearCookie('authToken');
   res.status(200).json({ message: 'Logout berhasil' });
};

const Distroy = async(req, res )=> {
   const userId = req.params.id;
    try {
      // Hapus user dari database
      const data = await User.findByIdAndDelete(userId);
       res.status('200').json({message : 'delete success', data : data})

   } catch (error) {
   res.status('500').json({message : 'failure', error : error.message})
       
   }
   
};

const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, email, telp } = req.body;

        // Validasi data yang diperlukan
        if (!nama || !email || !telp) {
            return res.status(400).json({ message: 'Nama, email, dan telepon harus diisi' });
        }

        // Fetch profil pengguna yang ada
        const currentProfile = await User.findById(id);
        if (!currentProfile) {
            return res.status(404).json({ message: 'Profile tidak ditemukan' });
        }

        let imagePath = currentProfile.image; // URL gambar saat ini

        // Jika ada file baru yang diunggah
        if (req.file) {
            // Hapus gambar lama dari Cloudinary jika ada
            if (currentProfile.image) {
                const publicId = extractPublicId(currentProfile.image);
                await cloudinary.uploader.destroy(`profile/${publicId}`);
            }

            // Unggah gambar baru ke Cloudinary
            imagePath = await uploadToCloudinary(req.file.buffer, 'profile');
        }

        // Perbarui data pengguna di database
        const updatedProfile = await User.findByIdAndUpdate(
            id,
            { nama, email, telp, image: imagePath },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: 'Profile berhasil diperbarui', data: updatedProfile });
    } catch (error) {
        console.error(`Error updating profile with ID ${req.params.id}:`, error);
        res.status(500).json({
            message: 'Terjadi kesalahan saat memperbarui profile',
            error: error.message,
        });
    }
};

const updatePassword = async (req, res) => {
        try {
            const { id } = req.params;  
            const { oldPassword, newPassword, confirmNewPassword } = req.body;
             
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
        
             const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Old password is incorrect' });
            }
              if (newPassword !== confirmNewPassword) {
                return res.status(400).json({ message: 'New password does not match' });
            }
        
             const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();
        
            res.status(200).json({ message: 'Password updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error: error.message });
        }
    };

module.exports = {
   Login,
   Register,
   Logout,
   Distroy,
   updateProfile,
   getAllUser,
   updatePassword,
   getUserId
};
