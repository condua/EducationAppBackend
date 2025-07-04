const Course = require("../models/Course");
const User = require("../models/User");

// ✅ HÀM HELPER: Kiểm tra vai trò Admin
const checkAdmin = (req, res, next) => {
  // Giả sử middleware xác thực đã gắn `req.user`
  if (req.user && req.user.role === "admin") {
    next(); // Nếu là admin, cho phép đi tiếp
  } else {
    res
      .status(403)
      .json({ message: "Truy cập bị từ chối. Yêu cầu quyền Admin." });
  }
};
// 🎯 TẠO KHÓA HỌC (CHỈ DÀNH CHO ADMIN)
exports.createCourse = async (req, res) => {
  // ✅ Gán admin tạo khóa học làm giảng viên (mentor)
  const courseDataWithMentor = { ...req.body, mentor: req.user.id };
  const course = new Course(courseDataWithMentor);

  try {
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 🎯 SỬA KHÓA HỌC (CHỈ DÀNH CHO ADMIN)
exports.editCourse = async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Trả về document sau khi đã cập nhật
    );
    if (!updatedCourse) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }
    res.json(updatedCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 🎯 XÓA KHÓA HỌC (CHỈ DÀNH CHO ADMIN)
exports.deleteCourse = async (req, res) => {
  try {
    // ✅ Chuẩn hóa thành req.params.id
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }
    // TODO: Xóa courseId khỏi tất cả user đã enrolled
    res.json({ message: "Khóa học đã được xóa thành công" });
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
