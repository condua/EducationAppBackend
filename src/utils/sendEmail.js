// utils/sendEmail.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (email, subject, htmlContent) => {
  try {
    // 🟢 CẤU HÌNH MỚI CHO RENDER --
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Host chính xác của Gmail
      port: 465, // Port SSL (Thường không bị chặn trên Cloud)
      secure: true, // Bắt buộc true với port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng 16 ký tự
      },
      // Thêm dòng này để tránh lỗi chứng chỉ SSL trên một số server Linux
      tls: {
        rejectUnauthorized: false,
      },
    });

    // 2. Cấu hình nội dung email
    const mailOptions = {
      from: `"MLPA Support Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    // Kiểm tra kết nối trước khi gửi (Debug)
    await transporter.verify();
    console.log("Server đã kết nối thành công với Gmail.");

    // 3. Gửi email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to " + email);
  } catch (error) {
    console.log("Email not sent!");
    console.error("Lỗi chi tiết:", error);
    throw new Error("Không thể gửi email: " + error.message);
  }
};

module.exports = sendEmail;
