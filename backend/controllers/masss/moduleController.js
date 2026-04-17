const Module = require('../../models/masss/Module');
const Exam = require('../../models/masss/Exam');

// @route   POST /api/masss/modules
exports.createModule = async (req, res) => {
  try {
    const { name, category, color, energy_time, exams } = req.body;

    // 1. Create the Module
    const newModule = await Module.create({
      user_id: req.user.id,
      name,
      category,
      color,
      energy_time
    });

    // 2. Create associated exams (mirrors your for loop in FastAPI)
    if (exams && exams.length > 0) {
      const examData = exams.map(exam => ({
        ...exam,
        module_id: newModule._id,
        user_id: req.user.id
      }));
      await Exam.insertMany(examData);
    }

    // Return module with exams (mirrors return new_module)
    const result = await Module.findById(newModule._id).populate('exams');
    
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route   GET /api/masss/modules
exports.getModules = async (req, res) => {
  try {
    const modules = await Module.find({ user_id: req.user.id }).populate('exams');
    res.json({ success: true, data: modules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/masss/modules/:id
exports.getModule = async (req, res) => {
  try {
    const module = await Module.findOne({ _id: req.params.id, user_id: req.user.id }).populate('exams');
    if (!module) return res.status(404).json({ success: false, message: "Module not found" });
    res.json({ success: true, data: module });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/masss/modules/:id
exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!module) return res.status(404).json({ success: false, message: "Module not found" });
    res.json({ success: true, data: module });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/masss/modules/:id
exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (!module) return res.status(404).json({ success: false, message: "Module not found" });
    res.status(204).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};