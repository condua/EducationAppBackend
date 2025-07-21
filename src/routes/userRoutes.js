const express = require("express");
const {
  getUserById,
  getAllUsers,
  updateUserById,
  enrollCourse,
  getCurrentUser,
  // ✨ Hàm mới cho admin
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
} = require("../controllers/userController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// router.get("/:id", authMiddleware, getUserById);
/*-----------------------------------*\
|           ROUTES FOR ADMIN          |
\*-----------------------------------*/
// Lấy tất cả người dùng
router.get("/", authMiddleware, adminMiddleware, getAllUsers);

// ✨ TẠO người dùng mới
router.post("/", authMiddleware, adminMiddleware, createUserByAdmin);

// Lấy người dùng bất kỳ theo ID
router.get("/:id", authMiddleware, adminMiddleware, getUserById);

// ✨ CẬP NHẬT người dùng bất kỳ theo ID
router.put("/:id", authMiddleware, adminMiddleware, updateUserByAdmin);

// ✨ XÓA người dùng bất kỳ theo ID
router.delete("/:id", authMiddleware, adminMiddleware, deleteUserByAdmin);

router.get("/me", authMiddleware, getCurrentUser);
router.put("/:id", authMiddleware, updateUserById);
router.post("/enroll", authMiddleware, enrollCourse);
module.exports = router;
