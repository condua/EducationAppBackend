const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter",
    required: true,
  },
  lectureUrl: { type: String, required: true },
  pdfLecture: { type: String },
  pdfExercise: { type: String },
  content: { type: String },

  // Tham chiếu đến Quiz
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: false, // Không phải bài học nào cũng có quiz
  },
});

module.exports = mongoose.model("Lesson", LessonSchema);
