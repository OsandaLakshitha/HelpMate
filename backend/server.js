const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const notesRouter = require("./routes/notes");
const path = require("path");

dotenv.config();

const projectRoutes     = require("./routes/Broutes/projectRoutes").default;
const taskRoutes        = require("./routes/Broutes/taskRoutes").default;
const memberRoutes      = require("./routes/Broutes/memberRoutes").default;
const githubRoutes      = require("./routes/Broutes/githubRoutes").default;
const dashboardRoutes   = require("./routes/Broutes/dashboardRoutes").default;
const insightRoutes     = require("./routes/Broutes/insightRoutes").default;
const interactionRoutes = require("./routes/Broutes/interactionRoutes").default;
const profileRoutes     = require("./routes/Broutes/Profileroutes").default;
const predictionRoutes  = require("./routes/Broutes/Predictionroutes").default;

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");

    // ── Existing scheduler ────────────────────────────────────────────────
    const { startScheduler } = require("./services/Bservices/Scheduler.js");
    startScheduler();

    // ── NEW: RAP daily prediction refresh (midnight cron) ─────────────────
    // Runs recalculate() for every student in every open project at 00:00
    // This keeps BDailyLog filled even on days students don't complete tasks
    // Required for resilienceScore and studentRatio to work correctly
    require("./services/Bservices/dailyRefresh.js");
    console.log("✅ Daily prediction refresh scheduler started");
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/auth",          require("./routes/auth"));
app.use("/api/admin",         require("./routes/admin"));
app.use("/api/pricing",       require("./routes/pricing"));
app.use("/api",               require("./routes/recommendations"));
app.use("/api/notes",         notesRouter);
app.use("/api/peer-matching", require("./routes/peerMatching"));
app.use("/uploads",           express.static(path.join(__dirname, "../uploads")));
app.use("/uploads/pdfs",      express.static(path.join(__dirname, "../uploads/pdfs")));

app.use('/api/projects',      githubRoutes);
app.use('/api/projects',      projectRoutes);
app.use('/api/members',       memberRoutes);
app.use("/api/tasks",         taskRoutes);
app.use("/api/user",          dashboardRoutes);
app.use('/api/insights',      insightRoutes);
app.use('/api/interactions',  interactionRoutes);
app.use('/api/profile',       profileRoutes);
app.use('/api/prediction',    predictionRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});