const mongoose = require('mongoose');

const TaskStatus = {
    PENDING: "pending",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    ARCHIVED: "archived"
};

const PriorityLevel = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high"
};

const taskSchema = new mongoose.Schema({
    
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        index: true 
    },

    name: { type: String, required: true },
    description: { type: String },
    module_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Module', 
        required: true 
    },
    exam_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Exam', 
        default: null 
    },
    estimated_pomodoros: { type: Number, default: 1 },
    sessions_count: { type: Number, default: 0 },
    deadline: { type: Date },
    priority: { 
        type: String, 
        enum: Object.values(PriorityLevel), 
        default: PriorityLevel.MEDIUM 
    },
    difficulty: { type: Number, default: 3 },
    is_fixed: { type: Boolean, default: false },
    status: { 
        type: String, 
        enum: Object.values(TaskStatus), 
        default: TaskStatus.PENDING 
    }
}, { timestamps: { createdAt: 'created_at' } });

taskSchema.virtual('sessions', {
    ref: 'PomodoroSession',
    localField: '_id',
    foreignField: 'task_id'
});

module.exports = mongoose.model('Task', taskSchema);