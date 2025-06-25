const express = require("express");
const router = express.Router();

// Sử dụng destructuring để import các hàm controller, giống với file course.routes.js
const {
  createTest,
  getTestsByCourse,
  updateTest,
  deleteTest,
  getTestForTaking,
} = require("../controllers/testController");

// Import middleware
const { authMiddleware } = require("../middlewares/authMiddleware"); // Giả sử có cả adminMiddleware

// POST /api/tests/ - Tạo bài kiểm tra mới
// (Controller 'createTest' sẽ lấy courseId từ req.body)
router.post("/by-course/:courseId", [authMiddleware], createTest);

// GET /api/tests/by-course/:courseId - Lấy danh sách test của một khóa học
// -> Controller 'getTestsByCourse' sẽ lấy 'courseId' từ params
router.get("/by-course/:courseId", authMiddleware, getTestsByCourse);

// --- Các route liên quan đến một Bài test cụ thể ---

// GET /api/tests/:testId - Lấy thông tin một bài test để làm bài (đã ẩn đáp án)
// -> Controller 'getTestForTaking' sẽ lấy 'testId' từ params
router.get("/:testId", authMiddleware, getTestForTaking);

// PUT /api/tests/:testId - Cập nhật một bài test
// -> Controller 'updateTest' sẽ lấy 'testId' từ params
router.put("/:testId", [authMiddleware], updateTest);

// DELETE /api/tests/:testId - Xóa một bài test
// -> Controller 'deleteTest' sẽ lấy 'testId' từ params
router.delete("/:testId", [authMiddleware], deleteTest);

module.exports = router;
