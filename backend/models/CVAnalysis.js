const mongoose = require("mongoose");

const cvAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
    analysis: {
      name: String,
      email: String,
      phone: String,
      location: String,
      summary: String,
      experience: String,
      education: String,
      skills: [String],
      languages: [String],
      certifications: [String],
      projects: [
        {
          title: String,
          description: String,
          technologies: [String],
        },
      ],
    },
    skillGaps: [
      {
        skill: String,
        importance: {
          type: String,
          enum: ["High", "Medium", "Low"],
          default: "Medium",
        },
        missing: {
          type: Boolean,
          default: true,
        },
        suggestions: [String],
      },
    ],
    careerPaths: [
      {
        title: String,
        description: String,
        matchScore: Number,
        steps: [String],
        requiredSkills: [String],
        timeframe: String,
      },
    ],
    jobRecommendations: [
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
        source: String,
        postedDate: Date,
      },
    ],
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
cvAnalysisSchema.index({ userId: 1, createdAt: -1 });
cvAnalysisSchema.index({ "analysis.skills": 1 });

module.exports = mongoose.model("CVAnalysis", cvAnalysisSchema);
