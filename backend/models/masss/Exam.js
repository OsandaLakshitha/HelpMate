const mongoose = require('mongoose');

const ExamType = {
    FINAL: "final",
    MIDTERM: "midterm",
    QUIZ: "quiz",
    ASSIGNMENT: "assignment",
    PRESENTATION: "presentation",
    OTHER: "other"
};

const examSchema = new mongoose.Schema({
    
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        index: true 
    },

    name: { type: String, required: true },
    exam_type: { 
        type: String, 
        enum: Object.values(ExamType), 
        default: ExamType.QUIZ 
    },
    due_date: { type: Date, required: true },
    weight: { type: Number, default: 10 },
    is_completed: { type: Boolean, default: false },
    module_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Module', 
        required: true 
    }
}, { timestamps: true });

examSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'exam_id'
});

module.exports = mongoose.model('Exam', examSchema);