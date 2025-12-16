const express = require("express");
const fetch = require("node-fetch");
const dotenv = require("dotenv");

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "Thiếu nội dung tin nhắn." });
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          // "HTTP-Referer": "https://your-site-url.com/", // tùy chọn
          // "X-Title": "YourSiteName",                   // tùy chọn
        },
        body: JSON.stringify({
          model: "tngtech/deepseek-r1t2-chimera:free",
          messages: [
            {
              role: "user",
              content: message, // sử dụng nội dung từ client gửi lên
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("✅ OpenRouter response:", data);

    // Kiểm tra phản hồi từ mô hình
    if (!data.choices || !data.choices[0]?.message?.content) {
      return res.json({ reply: "Không nhận được phản hồi từ mô hình." });
    }

    const reply = data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("❌ OpenRouter error:", error);
    res.status(500).json({ reply: "Lỗi server hoặc mô hình AI." });
  }
});

module.exports = router;
