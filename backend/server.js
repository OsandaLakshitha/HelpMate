// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// Load environment variables
dotenv.config();

const app = express();

// ============== MIDDLEWARE ==============
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
    })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", require("./routes/auth"));

// Admin routes
app.use("/api/admin", require("./routes/admin"));

// Pricing routes
app.use("/api/pricing", require("./routes/pricing"));

// Notes routes (includes upload, list, MCQs, flashcards, regenerate)
app.use("/api/notes", require("./routes/notes"));

// Dashboard routes (stats, analytics, recommendations)
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// Calendar routes (Google Calendar integration)
app.use("/api/calendar", require("./routes/calendar"));

// Exam Prep routes
app.use("/api/exam-prep", require("./routes/examPrep"));

// Recommendations routes
app.use("/api", require("./routes/recommendations"));

// Peer Matching routes
app.use("/api/peer-matching", require("./routes/peerMatching"));


// MASSS routes
app.use('/api/masss', require('./routes/masss/profileRoutes'))
app.use('/api/masss/modules', require('./routes/masss/moduleRoutes'));
app.use('/api/masss/exams', require('./routes/masss/examRoutes'))
app.use('/api/masss/tasks', require('./routes/masss/taskRoutes'))
app.use('/api/masss/sessions', require('./routes/masss/sessionRoutes'))
app.use('/api/masss', require('./routes/masss/statsRoutes'))




// Health check

// Chat routes
app.use("/api/chat", require("./routes/chat"));

// ============== STATIC FILES ==============
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.get("/api/health", (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: "Server is running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ============== AI SERVER PROXY (Optional) ==============
// This allows frontend to check AI server status through backend
app.get("/api/ai-status", async (req, res) => {
    try {
        const axios = require('axios');
        const aiServerUrl = process.env.AI_SERVER_URL || 'http://localhost:4000';
        const response = await axios.get(`${aiServerUrl}/health`, { timeout: 5000 });
        res.json({
            success: true,
            aiServer: response.data
        });
    } catch (err) {
        res.json({
            success: false,
            error: 'AI server is not running',
            message: err.message
        });
    }
});

// ============== 404 HANDLER ==============
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: "Route not found",
        path: req.originalUrl
    });
});

// ============== ERROR HANDLING MIDDLEWARE ==============
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    
    // Multer file size error
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 10MB.'
        });
    }
    
    // MongoDB duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate entry. This record already exists.'
        });
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token. Please log in again.'
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired. Please log in again.'
        });
    }
    
    // Validation errors
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: messages.join(', ')
        });
    }
    
    // Default error
    res.status(err.status || 500).json({ 
        success: false, 
        message: err.message || "Something went wrong!" 
    });
});

// ============== START SERVER ==============
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🚀 HELPMATE Server running on port ${PORT}`);
    console.log(`${'='.repeat(50)}`);
    console.log(`📍 API Base: http://localhost:${PORT}/api`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
    console.log(`📅 Calendar: http://localhost:${PORT}/api/calendar`);
    console.log(`📝 Notes: http://localhost:${PORT}/api/notes`);
    console.log(`${'='.repeat(50)}\n`);
});

// ============== GRACEFUL SHUTDOWN ==============
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed.');
        process.exit(0);
    });
});


// TEMPORARY — add at bottom of server.js, remove after checkpoint
const {
  MasssProfile,
  MasssModule,
  MasssExam,
  MasssTask,
  MasssSession,
} = require('./models/masss')

console.log('[MASSS] Models loaded:',
  MasssProfile.modelName,
  MasssModule.modelName,
  MasssExam.modelName,
  MasssTask.modelName,
  MasssSession.modelName,
)

module.exports = app;
