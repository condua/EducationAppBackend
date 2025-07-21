const express = require("express");
const {
  getUserById,
  getAllUsers,
  updateUserById,
  enrollCourse,
  getCurrentUser,
  deleteUserById,
} = require("../controllers/userController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// router.get("/:id", authMiddleware, getUserById);
router.get("/", authMiddleware, adminMiddleware, getAllUsers);
router.get("/me", authMiddleware, getCurrentUser);
router.put("/:id", authMiddleware, updateUserById);
router.post("/enroll", authMiddleware, enrollCourse);
router.delete("/:id", authMiddleware, adminMiddleware, deleteUserById);

module.exports = router;
