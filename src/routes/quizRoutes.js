const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");

router.post("/", quizController.createQuiz);
router.get("/:id", quizController.getQuiz);
router.get("/", quizController.getAllQuizzes);
router.put("/:id", quizController.updateQuiz);
router.delete("/:id", quizController.deleteQuiz);
router.get("/:id/history/:userId", quizController.getQuizHistoryByUser); // Changed quizId to id
router.post("/:id/submit", quizController.submitQuiz); // Changed quizId to id

module.exports = router;
