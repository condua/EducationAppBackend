const Course = require("../models/Course");

exports.createCourse = async (req, res) => {
  const course = new Course(req.body);
  try {
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.editCourse = async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.courseId,
      req.body,
      { new: true }
    );
    if (!updatedCourse)
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    res.json(updatedCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.courseId);
    if (!course)
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    res.json({ message: "Khóa học đã được xóa" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
