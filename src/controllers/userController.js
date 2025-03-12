const User = require("../models/User");

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
