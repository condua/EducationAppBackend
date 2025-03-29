const User = require("../models/User");
const Course = require("../models/Course");

// Lấy thông tin user theo ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // Ẩn mật khẩu
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Lấy tất cả user (Chỉ admin mới được phép)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Cập nhật thông tin user
exports.updateUserById = async (req, res) => {
  try {
    const { fullName, phone, avatar } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, phone, avatar },
      { new: true }
    ).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "Không tìm thấy user" });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id; // Lấy user từ token sau khi xác thực

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại." });

    const course = await Course.findById(courseId);
    if (!course)
      return res.status(404).json({ message: "Khóa học không tồn tại." });

    // Kiểm tra xem user đã đăng ký khóa học chưa
    if (user.enrolledCourses.includes(courseId)) {
      return res
        .status(400)
        .json({ message: "Bạn đã đăng ký khóa học này rồi." });
    }

    // Thêm khóa học vào danh sách khóa học đã đăng ký
    user.enrolledCourses.push(courseId);
    await user.save();

    res
      .status(200)
      .json({
        message: "Đăng ký khóa học thành công!",
        enrolledCourses: user.enrolledCourses,
      });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error });
  }
};
