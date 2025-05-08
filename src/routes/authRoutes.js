const express = require("express");
const {
  register,
  login,
  forgotPassword,
  googleLogin,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/google-login", googleLogin);

module.exports = router;
