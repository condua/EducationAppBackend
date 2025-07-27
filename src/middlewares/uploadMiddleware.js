// middlewares/uploadMiddleware.js
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Cấu hình tài khoản Cloudinary của bạn
// Thư viện sẽ tự động đọc các biến môi trường CLOUDINARY_*
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình CloudinaryStorage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "chat_app_uploads", // Tên thư mục trên Cloudinary để lưu file
    allowed_formats: ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"], // Các định dạng file cho phép
    // public_id: (req, file) => 'computed-filename-using-request', // Tùy chọn: tạo tên file tùy chỉnh
  },
});

// Khởi tạo middleware multer với CloudinaryStorage.
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10, // Giới hạn kích thước file vẫn là 10MB
  },
});

module.exports = upload;
