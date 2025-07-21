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

// --- ✨ CÁC HÀM DÀNH CHO ADMIN ✨ ---

/**
 * @desc    Tạo người dùng mới (Admin)
 * @route   POST /api/users
 * @access  Private/Admin
 */
exports.createUserByAdmin = async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Mật khẩu sẽ được tự động hash bởi pre-save hook trong User Model
    const user = await User.create({
      email,
      password,
      fullName,
      role,
    });

    if (user) {
      const userResult = user.toObject();
      delete userResult.password;
      res.status(201).json(userResult);
    } else {
      res.status(400).json({ message: "Dữ liệu người dùng không hợp lệ" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * @desc    Cập nhật thông tin người dùng (Admin)
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
exports.updateUserByAdmin = async (req, res) => {
  try {
    // Admin có thể cập nhật nhiều trường hơn, bao gồm cả `role`
    const { fullName, email, role, phone, address, gender, birthDate } =
      req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Cập nhật các trường nếu chúng được cung cấp
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.role = role || user.role;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.gender = gender || user.gender;
    user.birthDate = birthDate || user.birthDate;

    const updatedUser = await user.save();

    const userResult = updatedUser.toObject();
    delete userResult.password;

    res.json(userResult);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * @desc    Xóa người dùng (Admin)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
exports.deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Trả về ID để frontend dễ dàng cập nhật state
    res.json({ message: "Xóa người dùng thành công", _id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
