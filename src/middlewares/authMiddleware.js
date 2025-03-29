const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

exports.authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res
        .status(401)
        .json({ message: "Không có token, truy cập bị từ chối" });
    }

    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );

    console.log("Decoded Token:", decoded); // ✅ Log để kiểm tra token

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "Người dùng không tồn tại" });
    }

    console.log("Authenticated User:", req.user); // ✅ Log kiểm tra user

    next();
  } catch (error) {
    console.error("Token Error:", error); // ✅ Log lỗi
    res.status(401).json({ message: "Token không hợp lệ", error });
  }
};

// Middleware chỉ cho phép admin
exports.adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Không có quyền truy cập" });
  }
  next();
};
