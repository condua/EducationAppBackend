const express = require("express");
const router = express.Router();
const {
  createCourse,
  getCourses,
  getCourseById,
  editCourse,
  deleteCourse,
} = require("../controllers/courseController");
const { authMiddleware } = require("../middlewares/authMiddleware"); // Kiểm tra xem middleware này có đúng không

router.post("/", authMiddleware, createCourse);
// router.get("/", authMiddleware, getCourses);
router.get("/", getCourses);
router.get("/:id", authMiddleware, getCourseById);
router.put("/:id", authMiddleware, editCourse);
router.delete("/:id", authMiddleware, deleteCourse);
module.exports = router;
