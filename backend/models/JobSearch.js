const mongoose = require("mongoose");

const jobSearchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cvAnalysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CVAnalysis",
    },
    searchQuery: {
      keywords: [String],
      location: String,
      jobType: String, // full-time, part-time, contract, etc.
      experienceLevel: String,
    },
    results: [
      {
        jobId: String,
        title: String,
        company: String,
        location: String,
        description: String,
        salary: {
          min: Number,
          max: Number,
          currency: String,
        },
        matchScore: Number,
        tags: [String],
        url: String,
        source: String, // linkedin, indeed, adzuna, etc.
        postedDate: Date,
        isApplied: {
          type: Boolean,
          default: false,
        },
        isSaved: {
          type: Boolean,
          default: false,
        },
      },
    ],
    totalResults: {
      type: Number,
      default: 0,
    },
    searchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
jobSearchSchema.index({ userId: 1, searchedAt: -1 });
jobSearchSchema.index({ "results.jobId": 1 });

module.exports = mongoose.model("JobSearch", jobSearchSchema);
