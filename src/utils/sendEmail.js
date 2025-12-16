// utils/sendEmail.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (email, subject, htmlContent) => {
  try {
    // 1. Tạo transporter (người vận chuyển)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Cấu hình nội dung email
    const mailOptions = {
      from: `"Support Team" <${process.env.EMAIL_USER}>`, // Tên người gửi
      to: email, // Email người nhận
      subject: subject, // Tiêu đề
      html: htmlContent, // Nội dung dạng HTML
    };

    // 3. Gửi email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to " + email);
  } catch (error) {
    console.log("Email not sent!");
    console.error(error);
    throw new Error("Không thể gửi email, vui lòng thử lại.");
  }
};

module.exports = sendEmail;
