// controllers/testAttempt.controller.js
const TestAttempt = require("../models/TestAttempt");
const Test = require("../models/Test");

// controllers/testAttempt.controller.js

exports.submitTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user.id;
    const { userAnswers, startedAt } = req.body;

    // 1. Lấy bài test gốc (không đổi)
    const originalTest = await Test.findById(testId);
    if (!originalTest) {
      return res.status(404).json({ message: "Không tìm thấy bài kiểm tra." });
    }

    // BƯỚC 2 (THAY ĐỔI): Chuyển câu trả lời của người dùng thành Map để tra cứu nhanh
    // Key là questionId, Value là selectedAnswer
    const userAnswersMap = new Map(
      userAnswers.map((ans) => [ans.questionId, ans.selectedAnswer])
    );

    let correctAnswersCount = 0;
    const detailedAnswers = [];
    const allQuestions = originalTest.questionGroups.flatMap(
      (group) => group.group_questions
    );
    const totalQuestions = allQuestions.length;

    // BƯỚC 3 (THAY ĐỔI): Chấm điểm bằng cách duyệt qua các câu hỏi từ DATABASE
    allQuestions.forEach((question) => {
      const selectedAnswer = userAnswersMap.get(question.id);
      const isAnswered = selectedAnswer !== undefined;
      let isCorrect = false;

      if (isAnswered && selectedAnswer === question.correctAnswer) {
        isCorrect = true;
        correctAnswersCount++;
      }

      detailedAnswers.push({
        questionId: question.id,
        // Lưu câu trả lời của user, nếu không trả lời thì lưu là null
        selectedAnswer: isAnswered ? selectedAnswer : null,
        isCorrect: isCorrect,
      });
    });

    // BƯỚC 4 (THAY ĐỔI): Tính điểm an toàn, tránh trường hợp chia cho 0
    const score =
      totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;

    const completedAt = new Date();

    // 5. Tạo và lưu lượt làm bài mới (không đổi)
    const newAttempt = new TestAttempt({
      user: userId,
      test: testId,
      course: originalTest.course,
      userAnswers: detailedAnswers,
      score: Math.round(score),
      totalQuestions,
      correctAnswersCount,
      startedAt,
      completedAt,
      timeTaken: Math.round((completedAt - new Date(startedAt)) / 1000), // tính bằng giây
    });

    await newAttempt.save();

    // 6. Trả về kết quả chi tiết (không đổi)
    res.status(201).json(newAttempt);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getUserTestHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await TestAttempt.find({ user: userId })
      .sort({ completedAt: -1 }) // Sắp xếp mới nhất lên đầu
      .populate("test", "title") // Lấy tên bài test
      .populate("course", "title"); // Lấy tên khóa học

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getSpecificAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await TestAttempt.findById(attemptId).populate({
      path: "test",
      model: "Test",
    }); // Populate toàn bộ bài test gốc để hiển thị câu hỏi và các lựa chọn

    if (!attempt) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lượt làm bài này." });
    }

    // Kiểm tra quyền sở hữu
    // if (attempt.user.toString() !== userId) {
    //   return res
    //     .status(403)
    //     .json({ message: "Bạn không có quyền xem kết quả này." });
    // }

    res.status(200).json(attempt);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getAttemptsByTest = async (req, res) => {
  try {
    // Lấy testId từ URL params
    const { testId } = req.params;

    // Kiểm tra xem bài test có tồn tại không để có thông báo lỗi rõ ràng
    const testExists = await Test.findById(testId);
    if (!testExists) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bài kiểm tra này." });
    }

    // Tìm tất cả các 'attempts' có trường 'test' khớp với testId
    const attempts = await TestAttempt.find({ test: testId })
      .sort({ score: -1, completedAt: 1 }) // Sắp xếp theo điểm từ cao đến thấp, sau đó theo thời gian
      .populate("user", "name email avatar"); // Lấy thông tin cơ bản của người dùng làm bài

    res.status(200).json(attempts);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getMyAttemptsForTest = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy ID người dùng đang đăng nhập
    const { testId } = req.params; // Lấy ID của bài test từ URL

    // Tìm tất cả các lượt làm bài khớp với cả userId và testId
    const attempts = await TestAttempt.find({
      user: userId,
      test: testId,
    }).sort({ completedAt: -1 }); // Sắp xếp để lần làm bài mới nhất lên đầu

    // Nếu không có lượt làm bài nào, trả về mảng rỗng là hợp lý
    res.status(200).json(attempts);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getAttemptsForTestInCourse = async (req, res) => {
  try {
    const { courseId, testId } = req.params;

    // 1. Tìm tất cả các attempts khớp với courseId và testId
    const attempts = await TestAttempt.find({
      course: courseId,
      test: testId,
    })
      // THAY ĐỔI 1: Populate để lấy 'fullName' và 'email' từ model User.
      .populate("user", "fullName email avatar")
      // THAY ĐỔI 2: Bỏ 'userName' và chỉ chọn các trường cần thiết.
      .select("user score userAnswers startedAt")
      // 4. Sắp xếp theo điểm giảm dần, sau đó theo thời gian hoàn thành tăng dần
      .sort({ score: -1, completedAt: 1 })
      // 5. Sử dụng .lean() để tăng tốc độ truy vấn vì chỉ cần đọc dữ liệu
      .lean();

    // THAY ĐỔI 3: Định dạng lại dữ liệu trả về để có 'email' thay vì 'userName'
    const formattedAttempts = attempts.map((attempt) => {
      return {
        _id: attempt._id,
        // Kiểm tra nếu user tồn tại (có thể đã bị xóa)
        fullName: attempt.user
          ? attempt.user.fullName
          : "Người dùng không xác định",
        avatar: attempt.user ? attempt.user.avatar : null,
        // Thay userName bằng email từ user đã populate
        email: attempt.user ? attempt.user.email : "Email không xác định",
        score: attempt.score,
        userAnswers: attempt.userAnswers,
        startedAt: attempt.startedAt,
      };
    });

    res.status(200).json(formattedAttempts);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
