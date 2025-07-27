const app = require("./app");
const http = require("http"); // 👈 Thêm vào
const { Server } = require("socket.io"); // 👈 Thêm vào
require("dotenv").config();

// --- TẠO HTTP SERVER VÀ GẮN SOCKET.IO ---
const server = http.createServer(app); // 👈 Tạo server từ app
const io = new Server(server, {
  // 👈 Khởi tạo socket.io
  cors: {
    origin: "*", // Cho phép tất cả các domain, nên thay bằng domain của frontend trong thực tế
    methods: ["GET", "POST"],
  },
});

// Gắn io vào app để có thể truy cập từ các controller thông qua `req.app.get('io')`
app.set("io", io);

// --- QUẢN LÝ KẾT NỐI SOCKET.IO ---
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Lắng nghe sự kiện khi client tham gia vào một cuộc trò chuyện
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation: ${conversationId}`);
  });

  // Lắng nghe sự kiện khi client rời khỏi cuộc trò chuyện
  socket.on("leaveConversation", (conversationId) => {
    socket.leave(conversationId);
    console.log(`User ${socket.id} left conversation: ${conversationId}`);
  });

  // Bạn có thể thêm một phòng riêng cho mỗi user để gửi thông báo cá nhân
  socket.on("joinUserRoom", (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined personal room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// Khởi động server
const PORT = process.env.PORT || 5000;

// Lắng nghe trên server đã tích hợp socket.io, thay vì app
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
