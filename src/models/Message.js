// models/message.model.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    type: { type: String, enum: ["text", "image", "file"], required: true },
    content: {
      text: { type: String },
      url: { type: String },
      name: { type: String },
      size: { type: Number },
    },
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
