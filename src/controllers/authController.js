const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { createCanvas } = require("canvas");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const sendWelcomeEmail = require("../utils/sendWelcomeEmail");
const sendEmail = require("../utils/sendEmail");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Tạo JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: 60 * 60 * 24 * 365 * 10,
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
    // ✅ Gửi email chào mừng
    try {
      await sendWelcomeEmail(email, fullName);
      console.log("Đã gửi email chào mừng");
    } catch (emailErr) {
      console.error("Gửi email thất bại:", emailErr.message);
      // Có thể bỏ qua lỗi này nếu không quan trọng
    }
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

// 🟢 [CẬP NHẬT] Quên mật khẩu - Gửi OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Email không tồn tại" });

    // Tạo mã OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP và thời gian hết hạn (5 phút)
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    // Nội dung email
    const subject = "Mã xác thực đặt lại mật khẩu";
    const htmlContent = `
       <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: teal;">Yêu cầu đặt lại mật khẩu</h2>
        <p>Xin chào <strong>${user.fullName}</strong>,</p>
        <p>Mã xác thực của bạn là:</p>
        <h1 style="color: teal; letter-spacing: 5px;">${otp}</h1>
        <p>Mã này có hiệu lực trong vòng <strong>5 phút</strong>.</p>
        <p style="color: #666; font-size: 12px;">Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
      </div>
    `;

    // Gửi email
    await sendEmail(email, subject, htmlContent);

    res.json({ message: "Mã xác thực đã được gửi tới email của bạn." });
  } catch (error) {
    console.error("Lỗi quên mật khẩu:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// 🟢 [MỚI] Xác thực OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    // Kiểm tra OTP và thời hạn
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Mã xác thực không đúng." });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Mã xác thực đã hết hạn." });
    }

    res.status(200).json({ message: "Xác thực thành công." });
  } catch (error) {
    console.error("Lỗi xác thực OTP:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// 🟢 [MỚI] Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    // Kiểm tra lại OTP lần nữa để bảo mật
    if (user.otp !== code || user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "Phiên xác thực không hợp lệ hoặc đã hết hạn." });
    }

    // Cập nhật mật khẩu (Pre-save hook trong Model sẽ tự hash)
    user.password = newPassword;

    // Xóa OTP
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res
      .status(200)
      .json({ message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại." });
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // 🟡 Nếu Google không có avatar, tự tạo avatar với canvas
      let avatarUrl = picture;
      if (!picture) {
        const avatarBuffer = await generateAvatar(name, email);
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { folder: "avatars", public_id: email.replace(/[@.]/g, "_") },
              (error, result) => (error ? reject(error) : resolve(result))
            )
            .end(avatarBuffer);
        });
        avatarUrl = uploadResult.secure_url;
      }

      const fakePassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(fakePassword, 10);

      user = await User.create({
        fullName: name,
        email,
        password: hashedPassword,
        avatar: avatarUrl,
      });
      // ✅ Gửi email chào mừng chỉ khi đăng nhập lần đầu
      try {
        await sendWelcomeEmail(user.email, user.fullName);
        console.log("Đã gửi email chào mừng");
      } catch (emailErr) {
        console.error("Gửi email thất bại:", emailErr.message);
        // Có thể bỏ qua lỗi này nếu không quan trọng
      }
    }

    const accessToken = generateToken(user);
    res.status(200).json({
      message: "Login thành công",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      accessToken,
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Google token không hợp lệ" });
  }
};
