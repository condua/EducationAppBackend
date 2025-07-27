// controllers/conversation.controller.js

// Giả định các model của bạn có tên file là .model.js
const Conversation = require("../models/Conversation.js");
const Message = require("../models/Message.js");
const User = require("../models/User.js");

// *** HÀM MỚI ***
// GET /api/conversations/users
// Lấy tất cả người dùng (trừ người dùng hiện tại)
exports.getAllUser = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "-password"
    );
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Tìm hoặc tạo một cuộc trò chuyện riêng tư (1-1)
exports.findOrCreatePrivateConversation = async (req, res) => {
  const { otherUserId } = req.body; // Chỉ cần ID của người dùng kia
  const currentUserId = req.user._id;

  if (!otherUserId) {
    return res.status(400).json({ message: "otherUserId is required." });
  }

  // Ngăn người dùng tự tạo cuộc trò chuyện với chính mình
  if (currentUserId.toString() === otherUserId) {
    return res
      .status(400)
      .json({ message: "You cannot create a conversation with yourself." });
  }

  try {
    // --- THÊM BƯỚC KIỂM TRA ---
    // 1. Kiểm tra xem người dùng kia có tồn tại trong hệ thống không
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        message: "The user you are trying to chat with does not exist.",
      });
    }
    // --- KẾT THÚC BƯỚC KIỂM TRA ---

    const allMembers = [currentUserId, otherUserId];

    // 2. Tìm cuộc trò chuyện riêng tư đã tồn tại giữa 2 người
    let conversation = await Conversation.findOne({
      type: "private",
      memberIds: { $all: allMembers, $size: 2 }, // Tìm chính xác 2 thành viên này
    }).populate("memberIds", "fullName avatar email");

    // Nếu đã có, trả về cuộc trò chuyện đó
    if (conversation) {
      return res.status(200).json(conversation);
    }

    // 3. Nếu chưa có, tạo mới
    const newConversation = await Conversation.create({
      type: "private",
      memberIds: allMembers,
    });

    const populatedConversation = await Conversation.findById(
      newConversation._id
    ).populate("memberIds", "fullName avatar email");

    return res.status(201).json(populatedConversation);
  } catch (error) {
    // Bắt lỗi nếu otherUserId không phải là một ObjectId hợp lệ
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid user ID format." });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// *** HÀM MỚI (TÁCH RA) ***
// POST /api/conversations/group
// Tạo một cuộc trò chuyện nhóm mới
exports.createGroupConversation = async (req, res) => {
  const { name, memberIds, avatarUrl } = req.body; // memberIds là mảng ID của các thành viên khác
  const currentUserId = req.user._id;

  if (!name || !memberIds || memberIds.length === 0) {
    return res
      .status(400)
      .json({ message: "Group name and memberIds are required." });
  }

  const allMembers = [currentUserId, ...memberIds];

  try {
    const newConversation = await Conversation.create({
      type: "group",
      name,
      avatarUrl:
        avatarUrl || "https://placehold.co/100x100/7C83FD/FFFFFF?text=GROUP",
      memberIds: allMembers,
    });

    const populatedConversation = await Conversation.findById(
      newConversation._id
    ).populate("memberIds", "fullName avatar email");

    return res.status(201).json(populatedConversation);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// GET /api/conversations
// Lấy tất cả các cuộc trò chuyện của người dùng hiện tại
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ memberIds: req.user._id })
      // SỬA LỖI: populate đúng trường 'fullName' và 'avatar' từ User model
      .populate("memberIds", "fullName avatar email")
      .populate({
        path: "lastMessage",
        populate: {
          path: "senderId",
          select: "fullName avatar", // Sửa ở đây
        },
      })
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// GET /api/conversations/:id/messages
// Lấy tất cả tin nhắn của một cuộc trò chuyện
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.id })
      // SỬA LỖI: populate đúng trường 'fullName' và 'avatar'
      .populate("senderId", "fullName avatar") // Sửa ở đây
      .sort({ createdAt: "asc" });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// POST /api/conversations/:id/messages
// Gửi một tin nhắn mới
exports.sendMessage = async (req, res) => {
  const { conversationId } = req.params;
  const { content, type } = req.body;
  const senderId = req.user._id;

  try {
    let messageContent = {};

    if (type === "text") {
      messageContent.text = content;
    } else if (req.file) {
      // Dành cho loại 'image' hoặc 'file'
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
      messageContent = {
        url: fileUrl,
        name: req.file.originalname,
        size: req.file.size,
      };
    } else {
      return res
        .status(400)
        .json({ message: "File or text content is required." });
    }

    const newMessage = await Message.create({
      conversationId,
      senderId,
      type: req.file
        ? req.file.mimetype.startsWith("image")
          ? "image"
          : "file"
        : "text",
      content: messageContent,
    }); //

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: newMessage._id,
      updatedAt: Date.now(),
    }); //
    const populatedMessage = await Message.findById(newMessage._id).populate(
      "senderId",
      "fullName avatar"
    );
    // .populate("conversationId"); // 👈 Thêm dòng này

    // --- TÍCH HỢP SOCKET.IO ---
    // 1. Lấy instance của io từ app
    const io = req.app.get("io");
    // 2. Gửi sự kiện 'newMessage' đến tất cả client trong phòng có ID là 'conversationId'
    io.to(conversationId).emit("newMessage", populatedMessage);
    // --- KẾT THÚC TÍCH HỢP ---

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// POST /api/conversations/:conversationId/invite
// Mời một người dùng vào nhóm chat
exports.inviteToGroup = async (req, res) => {
  const { conversationId } = req.params;
  const { userIdToInvite } = req.body;
  const currentUserId = req.user._id;

  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation || conversation.type !== "group") {
      return res.status(404).json({ message: "Group conversation not found." });
    }

    if (!conversation.memberIds.includes(currentUserId)) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group." });
    }

    if (conversation.memberIds.includes(userIdToInvite)) {
      return res.status(400).json({ message: "User is already in the group." });
    }

    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { $addToSet: { memberIds: userIdToInvite } },
      { new: true }
    )
      // SỬA LỖI: populate đúng trường 'fullName' và 'avatar'
      .populate("memberIds", "fullName avatar email");
    // --- TÍCH HỢP SOCKET.IO ---
    const io = req.app.get("io");

    // Gửi sự kiện cập nhật nhóm đến các thành viên hiện tại trong phòng
    io.to(conversationId).emit("groupUpdated", updatedConversation);

    // Gửi thông báo đến người dùng vừa được mời (nếu họ đang online)
    // Client cần tham gia một phòng với `userId` của chính mình khi kết nối
    io.to(userIdToInvite).emit("invitedToGroup", updatedConversation);
    // --- KẾT THÚC TÍCH HỢP ---

    res.json(updatedConversation);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// POST /api/conversations/:conversationId/leave
// Rời khỏi một nhóm chat
exports.leaveGroup = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation || conversation.type !== "group") {
      return res.status(404).json({ message: "Group conversation not found." });
    }

    if (!conversation.memberIds.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group." });
    }

    await Conversation.findByIdAndUpdate(conversationId, {
      $pull: { memberIds: userId },
    });

    res.json({ message: "Successfully left the group." });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
