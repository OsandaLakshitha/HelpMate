const express = require('express');
const router = express.Router();
const {
    addExam,
    getExamsByModule,
    updateExam
} = require('../../controllers/masss/examController');
const { protect } = require('../../middleware/auth');

router.use(protect);

router.post('/module/:module_id', addExam); // POST /exams/module/{module_id}
router.get('/module/:module_id', getExamsByModule); // GET /exams/module/{module_id}
router.put('/:id', updateExam); // PUT /exams/{exam_id}

module.exports = router;