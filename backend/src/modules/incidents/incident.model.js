const mongoose = require("mongoose");

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES = ["OPEN", "INVESTIGATING", "RESOLVED", "MUTED"];

const incidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    fingerprint: {
      type: String,
      required: true,
      unique: true,
    },
    service: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: SEVERITIES,
      default: "LOW",
    },
    status: {
      type: String,
      enum: STATUSES,
      default: "OPEN",
    },
    occurrences: {
      type: Number,
      default: 1,
    },
    firstSeenAt: {
      type: Date,
      default: Date.now,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    rootCauseAnalysis: {
      type: String,
      default: "",
    },
    fixRecommendation: {
      type: String,
      default: "",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize search by fingerprint, service, and status
incidentSchema.index({ fingerprint: 1 }, { unique: true });
incidentSchema.index({ service: 1, status: 1 });
incidentSchema.index({ lastSeenAt: -1 });

const Incident = mongoose.model("Incident", incidentSchema);

module.exports = Incident;
