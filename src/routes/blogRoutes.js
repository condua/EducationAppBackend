const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");

// CRUD routes
router.post("/", blogController.createBlog);
router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getBlogById);
router.put("/:id", blogController.updateBlog);
router.delete("/:id", blogController.deleteBlog);
router.get("/share/:id", blogController.shareBlog); // Get blog by ID for sharing

module.exports = router;
