// models/conversation.model.js
const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["private", "group"], required: true },
    name: { type: String }, // For group chats
    avatarUrl: { type: String }, // For group chats
    memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    themeColor: { type: String, default: "#1f2937" },
      
    // ✅ THÊM MỚI: Thêm trường ownerId
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    lastMessage: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
      type: { type: String, enum: ["text", "image", "file"] },
      content: {
        text: { type: String },
        url: { type: String },
        name: { type: String },
        size: { type: Number },
      },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date },
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
