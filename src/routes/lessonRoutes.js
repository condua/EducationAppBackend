const express = require("express");
const router = express.Router();
const {
  createLesson,
  getLesson,
  getAllLessons,
  updateLesson,
  deleteLesson,
} = require("../controllers/lessonController");
const { authMiddleware } = require("../middlewares/authMiddleware");

// Tạo mới Lesson
router.post("/", authMiddleware, createLesson);

// Lấy danh sách tất cả Lesson (có thể lọc theo chapter nếu cần)
router.get("/", authMiddleware, getAllLessons);

// Lấy thông tin chi tiết của Lesson theo id
router.get("/:id", authMiddleware, getLesson);

// Cập nhật thông tin Lesson theo id
router.put("/:id", authMiddleware, updateLesson);

// Xóa Lesson theo id
router.delete("/:id", authMiddleware, deleteLesson);

module.exports = router;
