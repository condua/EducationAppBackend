// models/Course.js
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
      avatar: String,
    },
    chapters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
      },
    ],

    // --- TRƯỜNG MỚI ĐƯỢC THÊM VÀO ---
    // Mảng chứa các ID tham chiếu đến các bài kiểm tra của khóa học
    tests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Test", // Tham chiếu đến model 'Test' vừa tạo
      },
    ],
    // ------------------------------------

    category: String,
    price: { type: String, default: "Free" },
    rating: { type: Number, default: 0 },
    students: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", CourseSchema);
