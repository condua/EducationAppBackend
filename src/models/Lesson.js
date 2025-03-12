const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter",
    required: true,
  },
  youtubeUrl: { type: String, required: true },
  pdfLecture: { type: String },
  pdfExercise: { type: String },
  content: { type: String },
});

module.exports = mongoose.model("Lesson", LessonSchema);
