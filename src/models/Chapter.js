const mongoose = require("mongoose");

const ChapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
});

module.exports = mongoose.model("Chapter", ChapterSchema);
