const mongoose = require("mongoose");

// Schema cho Blog
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 5,
  },
  content: {
    type: String,
    required: true,
    minlength: 10,
  },
  author: {
    type: String,
    required: true,
  },
  imageTitle: {
    type: String, // hoặc có thể dùng type: mongoose.Schema.Types.Mixed nếu có thể là file
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Blog", blogSchema);
