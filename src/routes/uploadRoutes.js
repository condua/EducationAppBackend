// routes/uploadRoutes.js
const express = require("express");
const { cloudinary, upload } = require("../config/cloudinary");
const router = express.Router();

// Sử dụng upload.single('image') để nhận file
router.post("/", upload, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  cloudinary.uploader
    .upload_stream(
      { resource_type: "auto" }, // Tự động nhận dạng tài nguyên (image, video, ...)
      (error, result) => {
        if (error) {
          return res.status(500).json({ message: "Upload failed", error });
        }
        // Trả về URL ảnh đã upload
        res.status(200).json({ imageUrl: result.secure_url });
      }
    )
    .end(req.file.buffer);
});

module.exports = router;
