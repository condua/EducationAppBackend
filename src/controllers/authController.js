const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Tạo JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Đăng ký tài khoản
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email đã được sử dụng" });

    // Tạo user mới
    const user = new User({ fullName, email, password, phone });
    await user.save();

    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra user có tồn tại không
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Tài khoản không tồn tại" });

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    // Tạo token
    const token = generateToken(user);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
    console.log(error);
  }
};

// Quên mật khẩu (Giả sử gửi email xác nhận, nhưng chưa triển khai)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Email không tồn tại" });

    // Ở đây có thể gửi email đặt lại mật khẩu (chưa triển khai)
    res.json({ message: "Vui lòng kiểm tra email để đặt lại mật khẩu" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};
