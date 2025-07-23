// middlewares/uploadMiddleware.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Đảm bảo thư mục 'uploads' tồn tại
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình nơi lưu trữ file và tên file
const storage = multer.diskStorage({
  /**
   * destination: Chỉ định thư mục để lưu các file đã tải lên.
   * @param {object} req - Đối tượng request của Express.
   * @param {object} file - Đối tượng file được tải lên.
   * @param {function} cb - Callback để hoàn tất việc xác định đích đến.
   */
  destination: function (req, file, cb) {
    // Các file sẽ được lưu vào thư mục 'uploads' ở thư mục gốc
    cb(null, "uploads/");
  },

  /**
   * filename: Chỉ định tên của file sẽ được lưu trên server.
   * @param {object} req - Đối tượng request của Express.
   * @param {object} file - Đối tượng file được tải lên.
   * @param {function} cb - Callback để hoàn tất việc đặt tên file.
   */
  filename: function (req, file, cb) {
    // Tạo một tên file duy nhất để tránh trùng lặp
    // Tên file sẽ có dạng: tenTruong-thoiGianHienTai.phanMoRong
    // Ví dụ: file-1721752800000.jpg
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Tùy chọn: Bộ lọc file để chỉ chấp nhận một số loại file nhất định
const fileFilter = (req, file, cb) => {
  // Chấp nhận các loại file phổ biến
  if (
    file.mimetype.startsWith("image") ||
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/msword" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    cb(null, true);
  } else {
    // Từ chối các loại file khác
    cb(new Error("File type not supported!"), false);
  }
};

// Khởi tạo middleware multer với cấu hình đã định nghĩa
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10, // Giới hạn kích thước file là 10MB
  },
});

module.exports = upload;
