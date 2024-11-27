const express = require("express") ;
const { forgetPassword, resetPassword } = require("../controllers/forgetPassword.controller.js") ;
const router = express.Router();

router.post("/forgetPassword", forgetPassword);
router.post("/reset-password/:token", resetPassword);

module.exports =  router;