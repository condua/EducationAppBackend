// utils/sendEmail.js
const SibApiV3Sdk = require("sib-api-v3-sdk");
require("dotenv").config();

// 1. Cấu hình Brevo Client
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

// 2. Hàm gửi email tổng quát
const sendEmail = async (toEmail, subject, htmlContent) => {
  // Đổi tên object thành emailConfig để không trùng tên với bất kỳ tham số nào
  const emailConfig = {
    sender: {
      email: process.env.SENDER_EMAIL,
      name: "MLPA Support Team",
    },
    to: [{ email: toEmail }], // Sử dụng đúng tham số toEmail truyền vào
    subject: subject,
    htmlContent: htmlContent, // Brevo bắt buộc dùng htmlContent, không phải html
  };

  try {
    // Thực hiện gửi
    await emailApi.sendTransacEmail(emailConfig);
    console.log("Email sent successfully via Brevo to: " + toEmail);

    return { success: true };
  } catch (error) {
    console.error("Email not sent!");

    // Logic bắt lỗi chi tiết của Brevo giúp dễ debug
    if (error.response && error.response.text) {
      console.error("Lỗi chi tiết từ Brevo API:", error.response.text);
    } else {
      console.error("Lỗi hệ thống:", error.message || error);
    }

    return { success: false };
  }
};

module.exports = sendEmail;
