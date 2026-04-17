const express = require('express');
const router = express.Router();
const {
    createTask,
    readTasks,
    updateTask,
    archiveTask
} = require('../../controllers/masss/taskController');
const { protect } = require('../../middleware/auth');

router.use(protect);

router.route('/')
    .post(createTask) // POST /tasks/
    .get(readTasks);  // GET /tasks/

router.route('/:id')
    .patch(updateTask)  // PATCH /tasks/{task_id}
    .delete(archiveTask); // DELETE /tasks/{task_id} (Soft delete/Archive)

module.exports = router;