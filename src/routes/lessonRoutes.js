const express = require("express");
const router = express.Router();
const {
  createLesson,
  getLesson,
  getAllLessons,
  updateLesson,
  deleteLesson,
} = require("../controllers/lessonController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");

// Tạo mới Lesson
router.post("/", authMiddleware, adminMiddleware, createLesson);

// Lấy danh sách tất cả Lesson (có thể lọc theo chapter nếu cần)
router.get("/", authMiddleware, getAllLessons);

// Lấy thông tin chi tiết của Lesson theo id
router.get("/:id", authMiddleware, getLesson);

// Cập nhật thông tin Lesson theo id
router.put("/:id", authMiddleware, adminMiddleware, updateLesson);

// Xóa Lesson theo id
router.delete("/:id", authMiddleware, adminMiddleware, deleteLesson);

module.exports = router;
