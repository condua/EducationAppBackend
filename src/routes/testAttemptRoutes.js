const express = require("express");
const router = express.Router();

// Import các controller functions tương ứng
const {
  submitTest,
  getUserTestHistory,
  getSpecificAttempt,
  getAttemptsByTest,
  getMyAttemptsForTest,
} = require("../controllers/testAttemptController");

// Import middleware xác thực
const { authMiddleware } = require("../middlewares/authMiddleware"); // Giả sử có cả adminMiddleware

// POST /api/attempts/submit/:testId
// Nộp bài làm của một bài test.
router.post("/submit/:testId", [authMiddleware], submitTest);

// GET /api/attempts/my-history
// Lấy lịch sử làm bài của người dùng đang đăng nhập.
router.get("/my-history", [authMiddleware], getUserTestHistory);

// GET /api/attempts/:attemptId
// Lấy chi tiết một lần làm bài cụ thể.
router.get("/:attemptId", [authMiddleware], getSpecificAttempt);

router.get("/by-test/:testId", [authMiddleware], getAttemptsByTest);

router.get(
  "/my-attempts-for-test/:testId",
  authMiddleware,
  getMyAttemptsForTest
);

module.exports = router;
