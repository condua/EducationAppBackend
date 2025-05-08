const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  content: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String },
  score: { type: Number, default: 1 },
});

const AnswerDetailSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  }, // Tham chiếu đến câu hỏi
  selectedOption: { type: Number, required: true }, // Người dùng chọn option nào (ví dụ 0,1,2,3)
  correctOption: { type: Number, required: true }, // Đáp án đúng là gì
  isCorrect: { type: Boolean, required: true }, // Trả lời đúng hay sai
});

const HistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  startedAt: { type: Date, default: Date.now },
  finishedAt: { type: Date },
  durationTaken: { type: Number },
  score: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  answersDetail: [AnswerDetailSchema], // <<< Thêm chỗ này để lưu từng câu trả lời
});
const QuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    tags: [{ type: String }],
    totalQuestions: { type: Number, required: true },
    duration: { type: Number, required: true }, // Thời gian giới hạn làm bài (phút)
    questions: [QuestionSchema],
    history: [HistorySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", QuizSchema);
