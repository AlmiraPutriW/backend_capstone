const User = require("../models/userModels");
const jwt = require("jsonwebtoken");
const bycrypt = require("bcrypt");
const nodemailer = require("nodemailer");
 

const forgetPassword = async (req, res) => {
    try {
       const user = await User.findOne({ email: req.body.email });
        
       if (!user) {
           return res.status(404).send({ message: "User not found" });
       }
  
       const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "10m" });
       const transporter = nodemailer.createTransport({
           service: "gmail",
           auth: {
               user: process.env.EMAIL,
               pass: process.env.PASSWORD_APP_EMAIL,
           },
           tls : {
            rejectUnauthorized : false,
           }
       });
  
       const mailOptions = {
        from: `"Reset Password" <${process.env.EMAIL}>`,
to: req.body.email,
subject: "Permintaan Reset Kata Sandi",
html: `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #4b4a91;">Permintaan Reset Kata Sandi</h2>
    <p>Halo,</p>
    <p>Kami menerima permintaan untuk mengatur ulang kata sandi Anda. Jika Anda merasa tidak melakukan permintaan ini, silakan abaikan email ini.</p>
    <p>Untuk mengatur ulang kata sandi Anda, silakan klik tombol di bawah ini:</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="https://sipraja-capstone.netlify.app/#/reset-password?token=${token}" 
         style="
            display: inline-block; 
            padding: 10px 20px; 
            font-size: 16px; 
            color: #fff; 
            background-color: #4b4a91; 
            text-decoration: none; 
            border-radius: 5px;
         ">
         Reset Kata Sandi
      </a>
    </div>
    <p style="color: #555;">Link ini hanya berlaku selama <strong>10 menit</strong>.</p>
    <p>Terima kasih,</p>
    <p>Tim SIPRAJA</p>
  </div>
`,
      };
  
       transporter.sendMail(mailOptions, (err, info) => {
           if (err) {
               return res.status(500).send({ message: err.message });
           }
           res.status(200).send({ message: "Token berhasil dikirim ke email anda" });
       });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};


  const resetPassword = async (req, res) => {
    try {
       const decodedToken = jwt.verify(
        req.params.token,
        process.env.JWT_SECRET_KEY
      );
  
       if (!decodedToken) {
        return res.status(401).send({ message: "Invalid token" });
      }
  
       const user = await User.findOne({ _id: decodedToken.userId });
      if (!user) {
        return res.status(401).send({ message: "no user found" });
      }
      
       const salt = await bycrypt.genSalt(10);
      req.body.newPassword = await bycrypt.hash(req.body.newPassword, salt);
  
       user.password = req.body.newPassword;
      await user.save();
  
       res.status(200).send({ message: "Password updated" });
    } catch (err) {
       res.status(500).send({ message: "token sudah kaldaluarsa" });
    }
  };

  module.exports = {
    forgetPassword,
    resetPassword
  }
