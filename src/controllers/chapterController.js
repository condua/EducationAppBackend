const Chapter = require("../models/Chapter");
const Course = require("../models/Course");

// Tạo mới một Chapter và cập nhật vào Course
exports.createChapter = async (req, res) => {
  try {
    const { title, course } = req.body;
    const chapter = await Chapter.create({ title, course });

    // Thêm chapter vừa tạo vào mảng chapters của Course
    await Course.findByIdAndUpdate(course, {
      $push: { chapters: chapter._id },
    });

    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({ message: "Error creating chapter", error });
  }
};

// Lấy thông tin một Chapter theo id
exports.getChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chapter", error });
  }
};

// Lấy danh sách tất cả các Chapter (có thể tùy chỉnh theo Course nếu cần)
exports.getAllChapters = async (req, res) => {
  try {
    const { courseId } = req.query;
    let chapters;
    if (courseId) {
      // Lấy các chapter theo courseId nếu có truyền tham số
      chapters = await Chapter.find({ course: courseId });
    } else {
      chapters = await Chapter.find();
    }
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chapters", error });
  }
};

// Cập nhật thông tin của một Chapter theo id
exports.updateChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: "Error updating chapter", error });
  }
};

// Xóa một Chapter theo id và cập nhật lại Course (loại bỏ chapter khỏi mảng chapters)
exports.deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findByIdAndDelete(id);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    // Loại bỏ chapter khỏi mảng chapters của Course tương ứng
    await Course.findByIdAndUpdate(chapter.course, {
      $pull: { chapters: chapter._id },
    });

    res.json({ message: "Chapter deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting chapter", error });
  }
};
