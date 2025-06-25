const Course = require("../models/Course");
const User = require("../models/User");

exports.createCourse = async (req, res) => {
  const course = new Course(req.body);
  try {
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.editCourse = async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCourse)
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    res.json(updatedCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.courseId);
    if (!course)
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    res.json({ message: "Khóa học đã được xóa" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getCourseById = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy userId từ token
    const courseId = req.params.id;

    // --- ĐÂY LÀ PHẦN THAY ĐỔI ---
    // Kiểm tra xem khóa học có tồn tại không và populate chapters, lessons, và tests
    const course = await Course.findById(courseId)
      .populate({
        path: "chapters",
        populate: {
          path: "lessons",
        },
      })
      .populate({
        path: "tests",
        // (Tùy chọn nhưng khuyến khích) Ẩn đáp án đúng khi populate
        select:
          "-questionGroups.group_questions.correctAnswer -questionGroups.group_questions.explanation",
      });
    // --------------------------------

    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    // Kiểm tra xem user có tồn tại không
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền truy cập khóa học này" });
    }

    // Kiểm tra xem user đã đăng ký khóa học chưa
    if (!user.enrolledCourses.includes(courseId)) {
      return res.status(403).json({ message: "Bạn chưa đăng ký khóa học này" });
    }

    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
