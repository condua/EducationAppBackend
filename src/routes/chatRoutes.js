const express = require("express");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_SYSTEM_PROMPT = `
Bạn là trợ lý AI của MLPA Education & Technology.

Quy tắc:
- Luôn trả lời bằng đúng ngôn ngữ người dùng sử dụng.
- Trả lời rõ ràng, chính xác và dễ hiểu.
- Nếu không chắc chắn về thông tin thì hãy nói rõ.
- Không tự bịa thông tin.
`;

router.post("/", async (req, res) => {
  try {
    const { message, systemPrompt = "", history = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const messages = [];

    // System Prompt
    messages.push({
      role: "system",
      content: `${DEFAULT_SYSTEM_PROMPT}

${systemPrompt}`,
    });

    // Lịch sử hội thoại
    if (Array.isArray(history) && history.length > 0) {
      messages.push(
        ...history.filter(
          (m) =>
            m &&
            (m.role === "user" ||
              m.role === "assistant" ||
              m.role === "system") &&
            typeof m.content === "string",
        ),
      );
    }

    // Tin nhắn hiện tại
    messages.push({
      role: "user",
      content: message,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return res.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("========== OPENAI ERROR ==========");
    console.error(error);

    console.error("Status:", error.status);
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Cause:", error.cause);

    if (error.response) {
      console.error(error.response.data);
    }

    return res.status(500).json({
      error: error.message,
      status: error.status,
      code: error.code,
    });
  }
});

module.exports = router;
