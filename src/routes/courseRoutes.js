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
router.get("/", getCourses);
router.get("/:id", getCourseById);
router.put("/:id", editCourse);
router.delete(":/id", deleteCourse);
module.exports = router;
