const mongoose = require('mongoose');

const SessionEndType = {
    COMPLETED: "completed",
    STOPPED: "stopped",
    ABORTED: "aborted",
    SKIPPED: "skipped"
};

const sessionSchema = new mongoose.Schema({
    
    user_id: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true, 
            index: true 
        },

    task_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Task', 
        required: true 
    },
    start_time: { 
        type: Date, 
        default: () => new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)) // SL Time
    },
    end_time: { type: Date },
    duration_minutes: { type: Number, default: 0.0 },
    is_completed: { type: Boolean, default: false },
    focus_rating: { type: Number },
    end_type: { 
        type: String, 
        enum: Object.values(SessionEndType), 
        default: SessionEndType.COMPLETED 
    },
    slot_type: { type: String, required: true }
});

module.exports = mongoose.model('PomodoroSession', sessionSchema);