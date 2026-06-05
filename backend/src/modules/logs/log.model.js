const mongoose = require("mongoose");

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const SOURCES = ["FRONTEND", "BACKEND", "DATABASE", "API", "SYSTEM"];
const STATUSES = ["OPEN", "INVESTIGATING", "RESOLVED"];

const logSchema = new mongoose.Schema(
  {
    service: {
      type: String,
      required: true,
      trim: true,
    },
    environment: {
      type: String,
      default: "production",
      trim: true,
    },
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
    fingerprint: {
      type: String,
      index: true,
    },
    traceId: {
      type: String,
      index: true,
    },
    endpoint: {
      type: String,
      default: "",
    },
    method: {
      type: String,
      default: "",
    },
    statusCode: {
      type: Number,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

// Optimize query performance for dashboard metrics
logSchema.index({ service: 1, createdAt: -1 });
logSchema.index({ severity: 1, createdAt: -1 });

const Log = mongoose.model("Log", logSchema);

module.exports = Log;