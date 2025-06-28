const express = require("express");
const router = express.Router();
const {
  createChapter,
  getChapter,
  getAllChapters,
  updateChapter,
  deleteChapter,
} = require("../controllers/chapterController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");

// Tạo mới Chapter
router.post("/", authMiddleware, adminMiddleware, createChapter);

// Lấy danh sách tất cả các Chapter (có thể lọc theo courseId qua query nếu cần)
router.get("/", authMiddleware, getAllChapters);

// Lấy thông tin chi tiết của một Chapter theo id
router.get("/:id", authMiddleware, getChapter);

// Cập nhật Chapter theo id
router.put("/:id", authMiddleware, adminMiddleware, updateChapter);

// Xóa Chapter theo id
router.delete("/:id", authMiddleware, adminMiddleware, deleteChapter);

module.exports = router;
