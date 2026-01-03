const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const notesRouter = require("./routes/notes");
const path = require("path");

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // ← Not '*'
    credentials: true, // ← Needed for cookies
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
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/pricing", require("./routes/pricing"));
app.use("/api", require("./routes/recommendations"));
app.use("/api/notes", notesRouter);
app.use("/api/peer-matching", require("./routes/peerMatching"));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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
