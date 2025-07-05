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
// 🎯 TẠO KHÓA HỌC (CHỈ DÀNH CHO ADMIN) - SỬA LẠI FILE NÀY

exports.createCourse = async (req, res) => {
  // Dữ liệu từ frontend (req.body) đã chứa đầy đủ thông tin,
  // bao gồm cả object 'mentor' đã được định dạng sẵn.
  // Vì vậy, chúng ta chỉ cần truyền thẳng req.body vào.
  const course = new Course(req.body);

  try {
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (err) {
    // Thêm console.log để gỡ lỗi tốt hơn ở phía server
    console.error("Lỗi khi tạo khóa học:", err);
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
    const userRole = req.user.role; // Lấy vai trò của người dùng từ token
    const courseId = req.params.id;

    // --- PHẦN THAY ĐỔI: Bỏ dòng 'select' trong populate tests ---
    const course = await Course.findById(courseId)
      .populate({
        path: "chapters",
        populate: {
          path: "lessons",
        },
      })
      .populate({
        path: "tests",
        // KHÔNG CÓ DÒNG 'select' NÀO Ở ĐÂY NỮA
      });
    // -----------------------------------------------------------

    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    // Nếu là admin, cho phép truy cập luôn mà không cần kiểm tra đăng ký
    if (userRole === "admin") {
      return res.json(course);
    }

    // Nếu không phải admin, tiếp tục kiểm tra quyền truy cập thông thường
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền truy cập khóa học này" });
    }

    // Kiểm tra xem user đã đăng ký khóa học chưa (chỉ áp dụng cho non-admin)
    if (!user.enrolledCourses.includes(courseId)) {
      return res.status(403).json({ message: "Bạn chưa đăng ký khóa học này" });
    }

    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
