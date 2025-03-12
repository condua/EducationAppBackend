const express = require("express");
const {
  getUserById,
  getAllUsers,
  updateUserById,
} = require("../controllers/userController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:id", authMiddleware, getUserById);
router.get("/", authMiddleware, adminMiddleware, getAllUsers);
router.put("/:id", authMiddleware, updateUserById);

module.exports = router;
