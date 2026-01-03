const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      default: "Hey! I'd love to connect and study together!",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
connectionRequestSchema.index({ sender: 1, sentAt: -1 });
connectionRequestSchema.index({ recipient: 1, sentAt: -1 });

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);
