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
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "MyLocalApp",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1:free",
          messages: [{ role: "user", content: message }],
        }),
      }
    );

    const data = await response.json();
    console.log("OpenRouter response:", data);

    if (!data.choices || !data.choices[0]?.message?.content) {
      return res.json({ reply: "Không nhận được phản hồi từ mô hình." });
    }

    const reply = data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("OpenRouter error:", error);
    res.status(500).json({ reply: "Lỗi server hoặc mô hình AI." });
  }
});

module.exports = router;
