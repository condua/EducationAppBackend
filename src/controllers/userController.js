const User = require("../models/User");
const Course = require("../models/Course");

// Lấy thông tin người dùng hiện tại
exports.getCurrentUser = async (req, res) => {
  try {
    // `req.user` đã có thông tin từ `authMiddleware`, không cần tìm lại
    res.json(req.user);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

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
// Lấy tất cả user (Chỉ admin mới được phép) - có phân trang
// Cập nhật: Lấy tất cả user - có phân trang VÀ TÌM KIẾM
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || ""; // Lấy từ khóa tìm kiếm
    const skip = (page - 1) * limit;

    // Tạo điều kiện tìm kiếm
    const query = search
      ? {
          $or: [
            { fullName: { $regex: search, $options: "i" } }, // 'i' for case-insensitive
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [users, totalUsers] = await Promise.all([
      User.find(query) // Áp dụng điều kiện tìm kiếm
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(query), // Đếm tổng số user khớp với điều kiện
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      currentPage: page,
      totalPages,
      totalUsers,
      users,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách user:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Mới: Xóa người dùng theo ID (Chỉ admin)
exports.deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    // Tùy chọn: Xóa người dùng khỏi các khóa học, v.v. nếu cần

    res.status(200).json({ message: "Xóa người dùng thành công." });
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Cập nhật thông tin user
exports.updateUserById = async (req, res) => {
  try {
    const { fullName, phone, avatar, gender, address, birthDate } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, phone, avatar, gender, address, birthDate },
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

    res.status(200).json({
      message: "Đăng ký khóa học thành công!",
      enrolledCourses: user.enrolledCourses,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error });
  }
};
