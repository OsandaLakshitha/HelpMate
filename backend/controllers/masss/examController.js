const Exam = require('../../models/masss/Exam');
const Module = require('../../models/masss/Module');

// @route   POST /api/masss/exams/module/:module_id
exports.addExam = async (req, res) => {
  try {
    // 1. Verify Module exists and belongs to user
    const module = await Module.findOne({ _id: req.params.module_id, user_id: req.user.id });
    if (!module) return res.status(404).json({ success: false, message: "Module not found" });

    // 2. Create Exam
    const newExam = await Exam.create({
      ...req.body,
      module_id: req.params.module_id,
      user_id: req.user.id
    });

    res.status(201).json({ success: true, data: newExam });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route   GET /api/masss/exams/module/:module_id
exports.getExamsByModule = async (req, res) => {
  try {
    const exams = await Exam.find({ module_id: req.params.module_id, user_id: req.user.id });
    res.json({ success: true, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/masss/exams/:id
exports.updateExam = async (req, res) => {
  try {
    // Mirrors logic: only update fields that were sent
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });
    res.json({ success: true, data: exam });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};