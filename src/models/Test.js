// models/Test.js
const mongoose = require("mongoose");

// Schema cho một câu hỏi riêng lẻ (sub-document)
const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // ID duy nhất cho câu hỏi, có thể dùng uuid
  question: { type: mongoose.Schema.Types.Mixed, required: true }, // Có thể là String hoặc Array of Strings
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true }, // Index của đáp án đúng trong mảng options
  explanation: { type: String }, // Giải thích đáp án (tùy chọn)
});

// Schema cho một nhóm câu hỏi (ví dụ: một đoạn văn có nhiều câu hỏi)
// có thể mở rộng thêm các loại nhóm khác trong tương lai
const QuestionGroupSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // ID duy nhất cho nhóm
  type: { type: String, default: "passage_group" }, // Loại nhóm câu hỏi
  title: { type: String, required: true },
  instructions: { type: String }, // Hướng dẫn cho nhóm câu hỏi
  passage: { type: String }, // Đoạn văn hoặc ngữ cảnh chung
  group_questions: { type: [QuestionSchema], required: true },
});

// Schema chính cho bài kiểm tra
const TestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    durationInMinutes: { type: Number, required: true }, // Thời gian làm bài (phút)

    // Tham chiếu ngược lại tới khóa học chứa bài test này
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // Nhúng trực tiếp các nhóm câu hỏi vào bài test
    // Vì một bài test là một đơn vị độc lập và luôn cần load hết câu hỏi
    questionGroups: { type: [QuestionGroupSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Test", TestSchema);
