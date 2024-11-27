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
        from: `"reset Password" <${process.env.EMAIL}>`,
        to: req.body.email,
        subject: "Reset Password",
        text: `Please click on the following link to reset your password:. This link will expire in 10 minutes.`,
        html: `<p>Please click on the following link to reset your password:</p>
               <p> ${token}</p>
               <p>This link willa expire in 10 minutes.</p>
               <p>If you did not request a password reset, please ignore this email.</p>,
               <a href="http://localhost:5000/reset/reset-password${token}">Klik di sini untuk update password</a>`
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