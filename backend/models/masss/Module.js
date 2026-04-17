const mongoose = require('mongoose');

const Category = {
    CODING: "coding",
    MATH_LOGIC: "math_logic",
    LANGUAGE: "language",
    CREATIVE_DESIGN: "creative_design",
    MEMORIZATION: "memorization",
    OTHER: "other"
};

const EnergyTime = {
    MORNING: "morning",
    AFTERNOON: "afternoon",
    EVENING: "evening"
};

const moduleSchema = new mongoose.Schema({
    
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        index: true 
    },


    name: { type: String, required: true },
    color: { type: String, default: "#E89BAE" },
    category: { 
        type: String, 
        enum: Object.values(Category), 
        default: Category.OTHER 
    },
    energy_time: { 
        type: String, 
        enum: Object.values(EnergyTime), 
        default: EnergyTime.AFTERNOON 
    }
}, { timestamps: true });

// Virtuals to mimic SQLAlchemy relationships
moduleSchema.virtual('exams', {
    ref: 'Exam',
    localField: '_id',
    foreignField: 'module_id'
});

moduleSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'module_id'
});

module.exports = mongoose.model('Module', moduleSchema);