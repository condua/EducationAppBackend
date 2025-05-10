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
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Thư cảm ơn từ MLPA</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f5f5f5; font-family:'Times New Roman', Times, serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background-color:#ffffff;">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #66c2ff, #005792, #00264d); color:white; padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="30%" style="vertical-align: middle;">
                          <img src="https://res.cloudinary.com/dy9yts4fa/image/upload/v1746871241/logo/logo_wzjqfj.png" alt="MLPA Logo" style="height:40px; max-width:100%;">
                        </td>
                        <td width="70%" align="right" style="font-size:13px; color:white;">
                          <div>📞 <a href="tel:+84399915548" style="color:white; text-decoration: none">(+84) 399915548</a></div>
                          <div>📧 <a href="mailto:phanhoangphuc0311@gmail.com" style="color: white; text-decoration:none;">phanhoangphuc0311@gmail.com</a></div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
    
                <!-- Body -->
                <tr>
                  <td style="padding: 30px;">
                    <h2 style="margin-top:0; font-size:20px; color:#00264d;">Bạn đã đăng ký tài khoản thành công tại MLPA. <span style="color:#f7c800;">🌟</span></h2>
                    <p style="font-size:16px; color:#333;">Xin chào <strong>${fullName}</strong>,</p>
                    <p style="font-size:15px; color:#333;">Cảm ơn bạn đã tin tưởng và lựa chọn <strong>Công nghệ và Giáo dục MLPA</strong> là người đồng hành trên hành trình học tập của mình. Chúng tôi vô cùng trân trọng sự quan tâm và mong rằng bạn sẽ có những trải nghiệm học tập hiệu quả, truyền cảm hứng và đáng nhớ tại MLPA.</p>
                    <p style="font-size:15px; color:#333;">Nếu bạn có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với chúng tôi. Chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>
                    <p style="font-size:14px; color:#333;">Trân trọng,<br><strong>Đội ngũ MLPA</strong></p>
                  </td>
                </tr>
    
                <!-- Footer: Người gửi -->
                <tr>
                  <td style="background-color:#f7f7f7; padding:20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="60" valign="top">
                          <img src="https://res.cloudinary.com/dy9yts4fa/image/upload/v1746872340/logo/avatar_s0jocj.png" alt="Phan Hoàng Phúc" style="width:60px; height:60px; border-radius:50%; object-fit:cover;">
                        </td>
                        <td style="padding-left:15px; font-size:13px; color:#333;">
                          <div style="font-weight:bold; margin-bottom: 2px">Phan Hoàng Phúc</div>
                          <div style="font-size:12px; color:#555; margin-bottom: 2px">Nhà sáng lập MLPA</div>
                          <a href="mailto:phanhoangphuc0311@gmail.com" style="font-size:12px; color:#00264d; text-decoration:none; display: flex; align-items: center; gap: 5px"><span style="font-size: 20px; color: red">✉</span> phanhoangphuc0311@gmail.com</a>
                          <div style="display: flex; align-items: center; gap: 5px; margin-top: 2px ">
                            <!-- Biểu tượng Zalo và liên kết -->
                            <img src="https://res.cloudinary.com/dy9yts4fa/image/upload/v1746886062/logo/zalo-removebg-preview_swfjsm.png" alt="Zalo" style="width: 20px; vertical-align: middle;" />
                            <a href="https://zalo.me/84399915548" target="_blank" rel="noopener noreferrer" style="text-decoration: none">
                              0399915548
                            </a>
                          </div>
                          
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
    
                <!-- Social Links -->
                <tr>
                  <td style="background: linear-gradient(135deg, #00264d 0%, #005792 50%, #66c2ff 100%); color:white; text-align:center; padding:20px;">
                    <a href="https://www.facebook.com/profile.php?id=61574532009854" target="_blank" style="margin: 0 10px; text-decoration: none;">
                      <img src="https://cdn-icons-png.flaticon.com/24/733/733547.png" alt="Facebook" style="vertical-align: middle;">
                    </a>
                    <a href="https://www.youtube.com/@tonyphan34" target="_blank" style="margin: 0 10px; text-decoration: none;">
                      <img src="https://cdn-icons-png.flaticon.com/24/1384/1384060.png" alt="YouTube" style="vertical-align: middle;">
                    </a>
                    <a href="https://www.tiktok.com/@mlpaedutech" target="_blank" style="margin: 0 10px; text-decoration: none;">
                      <img src="https://cdn-icons-png.flaticon.com/24/3046/3046122.png" alt="TikTok" style="vertical-align: middle;">
                    </a>
                    <a href="https://www.instagram.com/condua1755" target="_blank" style="margin: 0 10px; text-decoration: none;">
                      <img src="https://cdn-icons-png.flaticon.com/24/2111/2111463.png" alt="Instagram" style="vertical-align: middle;">
                    </a>
                    <a href="https://www.linkedin.com/company/50290243" target="_blank" style="margin: 0 10px; text-decoration: none;">
                      <img src="https://cdn-icons-png.flaticon.com/24/145/145807.png" alt="LinkedIn" style="vertical-align: middle;">
                    </a>
                    <br/>
            <p style="font-size: 16px">© <span id="current-year"></span> MLPA Edutech. All rights reserved.</p>
                  </td>
                  <!-- All Rights Reserved -->
    <tr>
    
    </tr>
                </tr>
    
              </table>
            </td>
          </tr>
        </table>
        <script>
      document.getElementById("current-year").textContent = new Date().getFullYear();
    </script>
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
