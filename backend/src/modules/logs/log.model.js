const mongoose = require("mongoose");


const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const SOURCES = ["FRONTEND", "BACKEND", "DATABASE", "API", "SYSTEM"];
const STATUSES = ["OPEN", "INVESTIGATING", "RESOLVED"];


const logSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },

    severity: {
      type: String,
      enum: SEVERITIES,
      default: "LOW",
    },

    source: {
      type: String,
      enum: SOURCES,
      required: true,
    },

    stackTrace: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: STATUSES,
      default: "OPEN",
    },

    aiAnalysis: {
      type: String,
      default: "",
    },

    suggestedFix: {
      type: String,
      default: "",
    },

    confidenceScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);


const Log = mongoose.model("Log", logSchema);

module.exports = Log;