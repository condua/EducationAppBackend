const Quiz = require("../models/Quiz");

// Tạo mới một Quiz
exports.createQuiz = async (req, res) => {
  try {
    const {
      title,
      name,
      description,
      tags,
      totalQuestions,
      duration,
      questions,
    } = req.body;

    const newQuiz = await Quiz.create({
      title,
      name,
      description,
      tags,
      totalQuestions,
      duration,
      questions,
    });

    res.status(201).json(newQuiz);
  } catch (error) {
    res.status(500).json({ message: "Error creating quiz", error });
  }
};

// Lấy thông tin 1 Quiz theo _id
exports.getQuiz = async (req, res) => {
  try {
    const { id } = req.params; // Lấy id từ params
    const quiz = await Quiz.findById(id); // Tìm quiz theo _id

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Chuyển đổi _id thành id trong kết quả trả về
    const quizData = quiz.toObject(); // Chuyển đổi Mongoose document thành object
    quizData.id = quizData._id; // Thêm id (thay thế _id)
    delete quizData._id; // Xóa _id

    res.json(quizData); // Trả về quiz đã chuyển đổi
  } catch (error) {
    res.status(500).json({ message: "Error fetching quiz", error });
  }
};

// Lấy danh sách tất cả các Quiz
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find();

    // Chuyển đổi tất cả quiz thành object với id thay vì _id
    const quizzesWithId = quizzes.map((quiz) => {
      const quizData = quiz.toObject();
      quizData.id = quizData._id;
      delete quizData._id;
      return quizData;
    });

    res.json(quizzesWithId);
  } catch (error) {
    res.status(500).json({ message: "Error fetching quizzes", error });
  }
};

// Cập nhật thông tin của Quiz theo _id
exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedQuiz = await Quiz.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const quizData = updatedQuiz.toObject();
    quizData.id = quizData._id;
    delete quizData._id;

    res.json(quizData);
  } catch (error) {
    res.status(500).json({ message: "Error updating quiz", error });
  }
};

// Xóa Quiz theo _id
exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuiz = await Quiz.findByIdAndDelete(id);

    if (!deletedQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting quiz", error });
  }
};

// Lấy lịch sử làm bài của một user trong 1 quiz
exports.getQuizHistoryByUser = async (req, res) => {
  try {
    const { id, userId } = req.params; // Lấy id quiz và userId từ params

    const quiz = await Quiz.findById(id); // Tìm quiz theo _id
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const userHistory = quiz.history.filter((h) => h.userId === userId);
    if (userHistory.length === 0) {
      return res
        .status(404)
        .json({ message: "No history found for this user" });
    }

    res.json(userHistory);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user history", error });
  }
};

// Submit Quiz
exports.submitQuiz = async (req, res) => {
  try {
    const { id } = req.params; // id quiz từ URL
    const { userId, answers, durationTaken } = req.body; // thông tin từ request body

    // Tìm quiz theo _id
    const quiz = await Quiz.findById(id); // Sử dụng _id thay vì quizId
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let correctAnswers = 0;
    let score = 0;

    // Duyệt qua các câu hỏi và so sánh với câu trả lời của người dùng
    quiz.questions.forEach((question, index) => {
      if (question.correctAnswer === answers[index]) {
        correctAnswers++;
        score += question.score; // cộng điểm cho câu trả lời đúng
      }
    });

    const totalPossibleScore = quiz.questions.reduce(
      (acc, question) => acc + question.score,
      0
    );
    const normalizedScore = (score / totalPossibleScore) * 10;

    // Lưu lịch sử làm bài vào quiz history
    const history = {
      userId,
      score: normalizedScore,
      correctAnswers,
      startedAt: new Date(),
      finishedAt: new Date(),
      durationTaken,
    };

    // Cập nhật vào quiz
    quiz.history.push(history);
    await quiz.save();

    res.status(201).json({
      message: "Quiz submitted successfully",
      score: normalizedScore,
      correctAnswers,
    });
  } catch (error) {
    res.status(500).json({ message: "Error submitting quiz", error });
  }
};
