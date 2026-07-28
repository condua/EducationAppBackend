const express = require("express");
const fetch = require("node-fetch");
const dotenv = require("dotenv");

dotenv.config();
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

router.post("/", async (req, res) => {
  try {
    // Lấy message từ body request
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Dùng bản mini cho tiết kiệm và nhanh
      messages: [{ role: "user", content: message }],
      max_tokens: 500,
    });

    res.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "Lỗi kết nối OpenAI" });
  }
});

module.exports = router;
