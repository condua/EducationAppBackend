const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { createCanvas } = require("canvas");
const cloudinary = require("cloudinary").v2;

const bcrypt = require("bcryptjs");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Tạo JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
function getInitials(name) {
  const words = name.trim().split(" ");
  return words.length >= 2
    ? words[0][0].toUpperCase() + words[words.length - 1][0].toUpperCase()
    : words[0][0].toUpperCase();
}
function getRandomColor(email) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 70%, 50%)`; // Màu HSL ngẫu nhiên
}

async function generateAvatar(name, email) {
  const initials = getInitials(name);
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext("2d");

  // Màu nền ngẫu nhiên dựa trên email
  ctx.fillStyle = getRandomColor(email);
  ctx.fillRect(0, 0, 200, 200);

  // Chữ cái đầu
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 100px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, 100, 110);

  return canvas.toBuffer(); // Trả về ảnh dạng buffer
}

// Đăng ký tài khoản
// API Đăng ký
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email đã được sử dụng" });

    // Hash mật khẩu trước khi lưu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo avatar buffer
    const avatarBuffer = await generateAvatar(fullName, email);

    // Upload ảnh lên Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "avatars", public_id: email.replace(/[@.]/g, "_") },
      async (error, result) => {
        if (error) {
          console.error("Lỗi upload Cloudinary:", error);
          return res.status(500).json({ message: "Lỗi upload ảnh" });
        }

        // Tạo user mới với avatar từ Cloudinary
        const user = new User({
          fullName,
          email,
          password: hashedPassword,
          phone,
          avatar: result.secure_url, // Lưu URL ảnh từ Cloudinary
        });

        await user.save();
        const token = generateToken(user);
        res.json({ token, user });
      }
    );

    uploadStream.end(avatarBuffer);
  } catch (error) {
    console.error("Lỗi trong quá trình đăng ký:", error); // Log lỗi chi tiết
    res.status(500).json({ message: "Lỗi server", error });
  }
};
// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra user có tồn tại không
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Tài khoản không tồn tại" });

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    // Tạo token
    const token = generateToken(user);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
    console.log(error);
  }
};

// Quên mật khẩu (Giả sử gửi email xác nhận, nhưng chưa triển khai)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Email không tồn tại" });

    // Ở đây có thể gửi email đặt lại mật khẩu (chưa triển khai)
    res.json({ message: "Vui lòng kiểm tra email để đặt lại mật khẩu" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};
