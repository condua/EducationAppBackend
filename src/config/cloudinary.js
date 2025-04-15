// config/cloudinary.js
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình multer lưu file vào bộ nhớ
const storage = multer.memoryStorage(); // Lưu tạm trong bộ nhớ

// Định nghĩa upload sử dụng multer
const upload = multer({ storage: storage }).single("image"); // 'image' là tên field trong form-data

module.exports = { cloudinary, upload };
