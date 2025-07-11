const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { createCanvas } = require("canvas");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const sendWelcomeEmail = require("../utils/sendWelcomeEmail");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Tạo Access Token
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Access token thường có thời gian sống ngắn hơn (ví dụ: 1 giờ)
  });
};

// Tạo Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET, // Sử dụng secret riêng cho refresh token
    {
      expiresIn: "30d", // Refresh token có thời gian sống dài hơn (ví dụ: 30 ngày)
    }
  );
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
  // Sử dụng template literal để tạo chuỗi HSL
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
    // Lưu ý: Mật khẩu có thể không bắt buộc nếu bạn cho phép đăng ký qua Google mà không đặt mật khẩu
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
      password, // Mật khẩu sẽ được hash bởi pre-save hook trong UserSchema
      phone,
      avatar: uploadResult.secure_url,
    });

    // Tạo access token và refresh token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Lưu refresh token vào user
    user.refreshTokens.push(refreshToken);
    await user.save(); // Lưu user với refresh token

    // ✅ Gửi email chào mừng
    try {
      await sendWelcomeEmail(email, fullName);
      console.log("Đã gửi email chào mừng");
    } catch (emailErr) {
      console.error("Gửi email thất bại:", emailErr.message);
      // Có thể bỏ qua lỗi này nếu không quan trọng
    }

    // Trả về user (loại bỏ password và refreshTokens trước khi gửi về client)
    const { password: _, refreshTokens: __, ...userResponse } = user._doc;
    res.json({ accessToken, refreshToken, user: userResponse });
  } catch (error) {
    console.error("Lỗi trong quá trình đăng ký:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// 🟢 Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra user có tồn tại không và chọn trường password
    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(400).json({ message: "Tài khoản không tồn tại" });

    // Kiểm tra mật khẩu có tồn tại không (cho tài khoản đăng ký qua email)
    if (!user.password) {
      return res
        .status(400)
        .json({
          message:
            "Tài khoản chưa thiết lập mật khẩu. Vui lòng đăng nhập bằng Google hoặc đặt lại mật khẩu.",
        });
    }

    // Kiểm tra mật khẩu có khớp không
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    // Tạo access token và refresh token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Xóa tất cả refresh token cũ và thêm refresh token mới (cho mỗi lần đăng nhập mới)
    // Điều này đảm bảo chỉ có một refresh token hợp lệ cho mỗi phiên đăng nhập,
    // giúp quản lý phiên tốt hơn và có thể buộc đăng xuất các phiên cũ.
    user.refreshTokens = [refreshToken];
    await user.save();

    // Loại bỏ password và refreshTokens khi trả về user
    const { password: _, refreshTokens: __, ...userResponse } = user._doc;

    res.json({ accessToken, refreshToken, user: userResponse });
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

// 🟢 Đăng nhập bằng Google
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

      // Tạo mật khẩu giả để phù hợp với schema, nhưng sẽ không được sử dụng để đăng nhập trực tiếp
      const fakePassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(fakePassword, 10);

      user = await User.create({
        fullName: name,
        email,
        password: hashedPassword, // Mật khẩu giả được hash
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

    // Tạo access token và refresh token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Xóa tất cả refresh token cũ và thêm refresh token mới cho phiên Google Login này
    user.refreshTokens = [refreshToken];
    await user.save(); // Lưu user với refresh token

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
      refreshToken,
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Google token không hợp lệ" });
  }
};

// 🟢 Cấp lại Access Token bằng Refresh Token
exports.requestRefreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Không có refresh token" });
  }

  try {
    // Xác thực refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Tìm người dùng và kiểm tra xem refresh token có trong danh sách của người dùng không
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res
        .status(403)
        .json({ message: "Refresh token không hợp lệ hoặc đã bị thu hồi" });
    }

    // Tạo access token mới
    const newAccessToken = generateAccessToken(user);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Lỗi refresh token:", error);
    if (error.name === "TokenExpiredError") {
      return res
        .status(403)
        .json({ message: "Refresh token đã hết hạn. Vui lòng đăng nhập lại." });
    }
    res.status(403).json({ message: "Refresh token không hợp lệ" });
  }
};

// 🟢 Đăng xuất (Xóa refresh token khỏi DB)
exports.logout = async (req, res) => {
  const { refreshToken } = req.body; // Client gửi refresh token muốn xóa

  if (!refreshToken) {
    return res
      .status(400)
      .json({ message: "Không có refresh token để đăng xuất" });
  }

  try {
    // Xác thực refresh token để tìm người dùng
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Lọc bỏ refresh token cụ thể khỏi mảng của người dùng
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken
    );
    await user.save(); // Lưu thay đổi vào cơ sở dữ liệu

    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
    if (error.name === "TokenExpiredError") {
      return res
        .status(403)
        .json({
          message: "Refresh token đã hết hạn, không cần đăng xuất thêm",
        });
    }
    res.status(500).json({ message: "Lỗi server khi đăng xuất" });
  }
};
