const mongoose = require('mongoose');

const weeklyRoutineSchema = new mongoose.Schema({
    user_id: { type: Number, required: true, index: true },
    name: { type: String, required: true },
    activity_type: { 
        type: String, 
        enum: ["class", "sleep", "habit", "work"], 
        default: "class" 
    },
    day_of_week: { 
        type: String, 
        enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], 
        required: true 
    },
    start_time: { type: String, required: true }, // Format "HH:mm"
    end_time: { type: String, required: true }
});

const slotPreferenceSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        index: true 
    },
    slot_name: { 
        type: String, 
        enum: ["morning", "afternoon", "evening"], 
        required: true 
    },
    slot_label: { type: String },
    start_time: { type: String },
    end_time: { type: String },
    max_pomodoros: { type: Number, default: 4 },
    inferred_energy_score: { type: Number, default: 0.5 },
    is_preferred: { type: Boolean, default: false }
});

module.exports = {
    WeeklyRoutine: mongoose.model('WeeklyRoutine', weeklyRoutineSchema),
    SlotPreference: mongoose.model('SlotPreference', slotPreferenceSchema)
};