// routes/conversationRoutes.js
const express = require("express");
const router = express.Router();

// --- SỬA LỖI ---
// 1. Import middleware bằng cách destructuring để lấy đúng hàm
const { authMiddleware } = require("../middlewares/authMiddleware");

// 2. Import middleware để xử lý file upload (QUAN TRỌNG)
//    Hãy đảm bảo bạn có tệp này trong thư mục /middlewares
const upload = require("../middlewares/uploadMiddleware");

// 3. Import controller
const {
  getConversations,
  getMessages,
  sendMessage,
  inviteToGroup,
  leaveGroup,
  findOrCreatePrivateConversation,
  createGroupConversation,
  getAllUser,
  updateGroupInfo,
  removeMemberFromGroup,
  deleteGroup,
} = require("../controllers/conversationController");

// Lấy tất cả các cuộc trò chuyện của người dùng hiện tại
router.get("/users", authMiddleware, getAllUser);
router.get("/", authMiddleware, getConversations);

// Lấy tất cả tin nhắn của một cuộc trò chuyện
router.get("/:id/messages", authMiddleware, getMessages);

// Tạo hoặc lấy cuộc trò chuyện (nếu đã tồn tại)
router.post("/create-or-get", authMiddleware, findOrCreatePrivateConversation);
// Tạo cuộc trò chuyện nhóm mới
router.post("/group", authMiddleware, createGroupConversation);
// ✅ THÊM MỚI: Cập nhật thông tin nhóm (chỉ owner)
router.put("/:conversationId/group", authMiddleware, updateGroupInfo);
// Gửi một tin nhắn mới (Đã thêm middleware 'upload' để xử lý file)
router.post(
  "/:conversationId/messages",
  authMiddleware,
  upload.single("file"),
  sendMessage
);

// Mời người dùng vào nhóm
router.post("/:conversationId/invite", authMiddleware, inviteToGroup);
// ✅ THÊM MỚI: Xóa thành viên khỏi nhóm (chỉ owner)
router.post(
  "/:conversationId/remove-member",
  authMiddleware,
  removeMemberFromGroup
);
// Người dùng rời khỏi nhóm chat
router.post("/:conversationId/leave", authMiddleware, leaveGroup);

// ✅ THÊM MỚI: Xóa nhóm (chỉ owner)
router.delete("/:conversationId", authMiddleware, deleteGroup);
// Exports the router to be used in the main app
module.exports = router;
