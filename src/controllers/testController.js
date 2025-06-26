// controllers/test.controller.js
const Test = require("../models/Test");
const Course = require("../models/Course");

exports.createTest = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, durationInMinutes, questionGroups } = req.body;

    // 1. Kiểm tra xem khóa học có tồn tại không
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học." });
    }

    // 2. Tạo bài kiểm tra mới
    const newTest = new Test({
      title,
      description,
      durationInMinutes,
      questionGroups,
      course: courseId, // Gán ID của khóa học
    });

    await newTest.save();

    // 3. Cập nhật khóa học để thêm ID của bài test mới vào
    course.tests.push(newTest._id);
    await course.save();

    res.status(201).json(newTest);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getTestsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate("tests");

    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học." });
    }

    res.status(200).json(course.tests);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.updateTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const updatedData = req.body;

    const updatedTest = await Test.findByIdAndUpdate(testId, updatedData, {
      new: true,
    });

    if (!updatedTest) {
      return res.status(404).json({ message: "Không tìm thấy bài kiểm tra." });
    }

    res.status(200).json(updatedTest);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    const { testId } = req.params;

    // 1. Tìm và xóa bài test
    const deletedTest = await Test.findByIdAndDelete(testId);

    if (!deletedTest) {
      return res.status(404).json({ message: "Không tìm thấy bài kiểm tra." });
    }

    // 2. Gỡ bỏ ID của bài test khỏi mảng tests trong khóa học
    await Course.findByIdAndUpdate(deletedTest.course, {
      $pull: { tests: testId },
    });

    res.status(200).json({ message: "Đã xóa bài kiểm tra thành công." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getTestForTaking = async (req, res) => {
  try {
    const { testId } = req.params;
    // Lấy bài test nhưng loại bỏ các trường đáp án và giải thích
    const test = await Test.findById(testId).select(
      "-questionGroups.group_questions.correctAnswer -questionGroups.group_questions.explanation"
    );

    if (!test) {
      return res.status(404).json({ message: "Không tìm thấy bài kiểm tra." });
    }

    res.status(200).json(test);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ✅ CONTROLLER MỚI ĐƯỢC THÊM VÀO ĐÂY
/**
 * Lấy toàn bộ chi tiết bài test BAO GỒM CẢ ĐÁP ÁN.
 * Dùng cho trang hiển thị kết quả sau khi làm bài.
 */
exports.getTestWithAnswers = async (req, res) => {
  try {
    const { testId } = req.params;

    // Lấy bài test với đầy đủ các trường, không dùng .select() để loại bỏ
    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({ message: "Không tìm thấy bài kiểm tra." });
    }

    /**
     * LƯU Ý BẢO MẬT:
     * Trong một ứng dụng thực tế, bạn nên thêm logic kiểm tra ở đây.
     * Ví dụ: chỉ cho phép người dùng đã làm bài test này (có một bản ghi TestAttempt)
     * hoặc admin mới có quyền truy cập vào endpoint này.
     * * const hasAttempted = await TestAttempt.findOne({ user: req.user.id, test: testId });
     * if (!hasAttempted && req.user.role !== 'admin') {
     * return res.status(403).json({ message: "Bạn không có quyền xem đáp án." });
     * }
     */

    res.status(200).json(test);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
