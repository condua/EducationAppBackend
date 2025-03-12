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
// Kết nối DB
connectDB();

// Khởi tạo Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/course", coureRoutes);
app.use("/api/chapter", chapterRoutes);
app.use("/api/lesson", lessonRoutes);

// Route mặc định
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.get("/hello", (req, res) => {
  res.send("Hello World");
});

module.exports = app;
