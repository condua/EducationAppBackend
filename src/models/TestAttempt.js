// models/TestAttempt.js
const mongoose = require("mongoose");

// Một sub-document để lưu chi tiết câu trả lời của người dùng
// Việc này giúp truy xuất và hiển thị lại bài làm rất nhanh
const UserAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true }, // ID của câu hỏi đã trả lời
    selectedAnswer: { type: Number, required: true }, // Index của phương án người dùng đã chọn
    isCorrect: { type: Boolean, required: true }, // Câu trả lời này có đúng không?
  },
  { _id: false } // Không cần _id cho mỗi câu trả lời
);

const TestAttemptSchema = new mongoose.Schema(
  {
    // --- Các thông tin liên kết ---
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến model User (giả sử bạn có model này)
      required: true,
      index: true, // Đánh index để truy vấn lịch sử của 1 user thật nhanh
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test", // Tham chiếu đến bài test đã làm
      required: true,
      index: true, // Đánh index để xem thống kê của 1 bài test
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // Tham chiếu đến khóa học
      required: true,
    },

    // --- Thông tin về kết quả bài làm ---
    userAnswers: {
      type: [UserAnswerSchema], // Mảng lưu tất cả các câu trả lời của người dùng
      required: true,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswersCount: {
      type: Number,
      required: true,
    },

    // --- Thông tin về thời gian ---
    startedAt: {
      type: Date,
      default: Date.now, // Thời điểm bắt đầu làm bài
    },
    completedAt: {
      type: Date,
      default: Date.now + 1000000, // Thời điểm hoàn thành bài làm, mặc định là 1 giây sau khi bắt đầu
    },
    // Thời gian làm bài (tính bằng giây)
    timeTaken: {
      type: Number,
    },

    // (Tùy chọn) Nếu bạn có khái niệm "Đạt" hoặc "Không đạt"
    isPassed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

module.exports = mongoose.model("TestAttempt", TestAttemptSchema);
