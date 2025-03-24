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
  return `hsl(${hash % 360}, 70%, 50%)`;
}

async function generateAvatar(name, email) {
  const initials = getInitials(name);
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = getRandomColor(email);
  ctx.fillRect(0, 0, 200, 200);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 100px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, 100, 110);

  return canvas.toBuffer();
}

// 🟢 Đăng ký tài khoản
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Kiểm tra email đã tồn tại
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    // Kiểm tra mật khẩu hợp lệ
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    // Tạo avatar buffer và upload lên Cloudinary
    const avatarBuffer = await generateAvatar(fullName, email);
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "avatars", public_id: email.replace(/[@.]/g, "_") },
          (error, result) => (error ? reject(error) : resolve(result))
        )
        .end(avatarBuffer);
    });

    // Tạo user mới (mật khẩu sẽ được hash tự động trong UserSchema)
    const user = new User({
      fullName,
      email,
      password, // Không cần tự hash
      phone,
      avatar: uploadResult.secure_url,
    });

    await user.save();
    const token = generateToken(user);

    // Trả về user (loại bỏ password)
    const { password: _, ...userResponse } = user._doc;
    res.json({ token, user: userResponse });
  } catch (error) {
    console.error("Lỗi trong quá trình đăng ký:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// 🟢 Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra user có tồn tại không
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Tài khoản không tồn tại" });

    // Kiểm tra mật khẩu có tồn tại không
    if (!user.password) {
      return res
        .status(400)
        .json({ message: "Tài khoản chưa thiết lập mật khẩu" });
    }

    // Kiểm tra mật khẩu có khớp không
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    // Tạo token
    const token = generateToken(user);

    // Loại bỏ password khi trả về user
    const userResponse = { ...user._doc };
    delete userResponse.password;

    res.json({ token, user: userResponse });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// 🟢 Quên mật khẩu (Chưa triển khai gửi email)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Email không tồn tại" });

    res.json({ message: "Vui lòng kiểm tra email để đặt lại mật khẩu" });
  } catch (error) {
    console.error("Lỗi quên mật khẩu:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};
