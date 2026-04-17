const Task = require('../../models/masss/Task');
const Module = require('../../models/masss/Module');

// @route   POST /api/masss/tasks
exports.createTask = async (req, res) => {
  try {
    const module = await Module.findOne({ _id: req.body.module_id, user_id: req.user.id });
    if (!module) return res.status(404).json({ success: false, message: "Module not found or access denied" });

    const newTask = await Task.create({
      ...req.body,
      user_id: req.user.id,
      sessions_count: 0
    });

    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route   GET /api/masss/tasks (with filters)
exports.readTasks = async (req, res) => {
  try {
    const { status, module_id, exam_id, priority, difficulty } = req.query;
    
    // Base query: only current user's tasks
    let query = { user_id: req.user.id };

    // Mirrors: if status query provided use it, else exclude ARCHIVED
    if (status) {
      query.status = status;
    } else {
      query.status = { $ne: 'archived' };
    }

    if (module_id) query.module_id = module_id;
    if (exam_id) query.exam_id = exam_id;
    if (priority) query.priority = priority;
    if (difficulty) query.difficulty = difficulty;

    const tasks = await Task.find(query);
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PATCH /api/masss/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { $set: req.body }, // Mirrors payload.dict(exclude_unset=True)
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/masss/tasks/:id (Soft Delete)
exports.archiveTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { status: 'archived' }, // Soft delete logic
      { new: true }
    );
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, message: "Task archived successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};