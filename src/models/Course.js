const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    thumbnail: String,
    mentor: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mentor",
      },
      name: String,
      email: String,
    },
    // Thay vì nhúng ChapterSchema trực tiếp, sử dụng ObjectId tham chiếu đến Chapter
    chapters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
      },
    ],
    category: String,
    price: { type: String, default: "Free" },
    rating: { type: Number, default: 0 },
    students: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", CourseSchema);
