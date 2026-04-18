require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const coureRoutes = require("./routes/courseRoutes.js");
const chapterRoutes = require("./routes/chapterRoutes.js");
const lessonRoutes = require("./routes/lessonRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js"); // 👈 thêm dòng này
const blogRoutes = require("./routes/blogRoutes.js"); // 👈 thêm dòng này
const uploadRoutes = require("./routes/uploadRoutes.js"); // 👈 thêm dòng này
const quizRoutes = require("./routes/quizRoutes.js"); // 👈 thêm dòng này
const testRoutes = require("./routes/testRoutes.js"); // 👈 thêm dòng này
const testAttemptRoutes = require("./routes/testAttemptRoutes.js"); // 👈 thêm dòng này
const conversationRoutes = require("./routes/conversationRoutes.js"); // 👈 thêm dòng này
// Kết nối DB
connectDB();

// Khởi tạo Express app
const app = express();

// Middleware
// Cấu hình CORS để Frontend (mlpa.edu.vn) có thể gọi Backend (Render)
app.use(
  cors({
    origin: ["https://mlpa.edu.vn", "https://www.mlpa.edu.vn"],
    credentials: true,
  }),
);

// Cấu hình Header cho phép Google Popup
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/course", coureRoutes);
app.use("/api/chapter", chapterRoutes);
app.use("/api/lesson", lessonRoutes);
app.use("/api/chat", chatRoutes); // 👈 thêm dòng này
app.use("/api/blogs", blogRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/tests", testRoutes); // 👈 thêm dòng này
app.use("/api/attempts", testAttemptRoutes); // 👈 thêm dòng này
app.use("/api/conversations", conversationRoutes); // 👈 thêm dòng này
// app.use(
//   require("prerender-node").set("prerenderToken", process.env.PRERENDER_TOKEN)
// );

// Route mặc định
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.get("/hello", (req, res) => {
  res.send("Hello World");
});

module.exports = app;
