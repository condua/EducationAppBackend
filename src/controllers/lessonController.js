const Lesson = require("../models/Lesson");
const Chapter = require("../models/Chapter");

// Tạo mới một Lesson và cập nhật vào Chapter
exports.createLesson = async (req, res) => {
  try {
    const {
      title,
      chapter,
      youtubeUrl,
      pdfLecture,
      pdfExercise,
      content,
      time,
      locked,
    } = req.body;
    const lesson = await Lesson.create({
      title,
      chapter,
      youtubeUrl,
      pdfLecture,
      pdfExercise,
      content,
      time,
      locked,
    });

    // Cập nhật Chapter: thêm ID của lesson vừa tạo vào mảng lessons
    await Chapter.findByIdAndUpdate(chapter, {
      $push: { lessons: lesson._id },
    });

    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ message: "Error creating lesson", error });
  }
};

// Lấy thông tin một Lesson theo id
exports.getLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: "Error fetching lesson", error });
  }
};

// Lấy danh sách tất cả các Lesson
// Nếu có truyền query chapterId thì chỉ lấy lesson thuộc Chapter đó
exports.getAllLessons = async (req, res) => {
  try {
    const { chapterId } = req.query;
    let lessons;
    if (chapterId) {
      lessons = await Lesson.find({ chapter: chapterId });
    } else {
      lessons = await Lesson.find();
    }
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: "Error fetching lessons", error });
  }
};

// Cập nhật thông tin của Lesson theo id
exports.updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findByIdAndUpdate(id, req.body, { new: true });
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: "Error updating lesson", error });
  }
};

// Xóa Lesson theo id và cập nhật lại Chapter (loại bỏ tham chiếu của lesson)
exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    // Tìm và xóa lesson
    const lesson = await Lesson.findByIdAndDelete(id);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Loại bỏ lesson khỏi mảng lessons của Chapter tương ứng
    await Chapter.findByIdAndUpdate(lesson.chapter, {
      $pull: { lessons: lesson._id },
    });

    res.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting lesson", error });
  }
};
