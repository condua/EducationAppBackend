const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "noreply.ewallet.hcmut@gmail.com",
    pass: process.env.GMAIL_PASSWORD,
  },
});
const sendWelcomeEmail = async (email, fullName) => {
  try {
    const mailOptions = {
      from: {
        name: "MLPA",
        address: "noreply.ewallet.hcmut@gmail.com",
      },
      to: email,
      subject: `Cảm ơn ${fullName} đã đăng ký thành công tài khoản tại Giáo dục và Công nghệ MLPA`,
      html: `
  <!DOCTYPE html>
  <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <title>Thư cảm ơn từ MLPA</title>
    </head>
  <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Times New Roman', Times, serif;">

      <div style="max-width: 600px; margin: auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.05); border-radius: 8px; overflow: hidden;">

        <!-- Header -->

<!-- Header: Gradient ngược lại -->
<div style="background: linear-gradient(135deg, #66c2ff, #005792, #00264d); padding: 20px; display: flex; justify-content: space-between; align-items: center; color: white;">
  
  <!-- Logo chiếm 50% -->
  <div style="width: 50%;">
    <img src="https://res.cloudinary.com/dy9yts4fa/image/upload/v1746871241/logo/logo_wzjqfj.png" alt="MLPA Logo" style="height: 40px;">
  </div>

  <!-- Thông tin liên hệ chiếm 50% -->
  <div style="width: 50%; text-align: right; font-size: 13px;">
    <div>📞 (+84) 399915548</div>
    <div>📧 <a href="mailto:phanhoangphuc0311@gmail.com" style="color: #f7c800; text-decoration: none;">phanhoangphuc0311@gmail.com</a></div>
  </div>

</div>



        <!-- Body -->
        <div style="padding: 30px;">
          <h2 style="color: #00264d; font-size: 20px;">Cảm ơn bạn đã đăng ký tài khoản thành công! <span style="color:#f7c800;">🌟</span></h2>

          <p style="font-size: 16px; color: #333;">
            Xin chào <strong>${fullName}</strong>,
          </p>
          <p style="font-size: 15px; color: #333;">
            Cảm ơn bạn đã tin tưởng và lựa chọn <strong>Công nghệ và Giáo dục MLPA</strong> là người đồng hành trên hành trình học tập của mình.
            Chúng tôi vô cùng trân trọng sự quan tâm và mong rằng bạn sẽ có những trải nghiệm học tập hiệu quả, truyền cảm hứng và đáng nhớ tại MLPA.
          </p>

          <p style="font-size: 15px; color: #333;">
            Nếu bạn có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với chúng tôi. Chúng tôi luôn sẵn sàng hỗ trợ bạn!
          </p>

          <p style="font-size: 14px; color: #333;">
            Trân trọng,<br />
            <strong>Đội ngũ MLPA<strong/>
          </p>
        </div>

        <!-- Footer: Người gửi -->
        <div style="background-color: #f7f7f7; padding: 20px; display: flex; align-items: center;">
<img  src="https://res.cloudinary.com/dy9yts4fa/image/upload/v1746872340/logo/avatar_s0jocj.png"
  alt="Phan Hoàng Phúc"
  style="width: 60px; height: 60px; border-radius: 50%; margin-right: 15px; object-fit: cover; object-position: center;">

          <div style="margin-right: 5px;">
            <div style="font-weight: bold; font-size: 14px;">Phan Hoàng Phúc</div>
            <div style="font-size: 12px; color: #555;">Nhà sáng lập MLPA</div>
            <a href="mailto:phanhoangphuc0311@gmail.com" style="font-size: 12px; color: #00264d; text-decoration: none;">phanhoangphuc0311@gmail.com</a>
          </div>
        </div>

<!-- Bottom social links -->
<!-- Bottom social links -->
<div style="background: linear-gradient(135deg, #00264d 0%, #005792 50%, #66c2ff 100%); color: white; padding: 20px; text-align: center;">



  <a href="https://facebook.com/mlpa" target="_blank" style="margin: 0 10px; text-decoration: none;">
    <img src="https://cdn-icons-png.flaticon.com/24/733/733547.png" alt="Facebook" style="vertical-align: middle;">
  </a>
  <a href="https://youtube.com/@mlpa" target="_blank" style="margin: 0 10px; text-decoration: none;">
    <img src="https://cdn-icons-png.flaticon.com/24/1384/1384060.png" alt="YouTube" style="vertical-align: middle;">
  </a>
  <a href="https://www.tiktok.com/@mlpa" target="_blank" style="margin: 0 10px; text-decoration: none;">
    <img src="https://cdn-icons-png.flaticon.com/24/3046/3046122.png" alt="TikTok" style="vertical-align: middle;">
  </a>
  <a href="https://instagram.com/mlpa" target="_blank" style="margin: 0 10px; text-decoration: none;">
    <img src="https://cdn-icons-png.flaticon.com/24/2111/2111463.png" alt="Instagram" style="vertical-align: middle;">
  </a>
  <a href="https://linkedin.com/company/mlpa" target="_blank" style="margin: 0 10px; text-decoration: none;">
    <img src="https://cdn-icons-png.flaticon.com/24/145/145807.png" alt="LinkedIn" style="vertical-align: middle;">
  </a>
</div>

      </div>
    </body>
  </html>
`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
    throw new Error("Gửi email thất bại");
  }
};

module.exports = sendWelcomeEmail;
