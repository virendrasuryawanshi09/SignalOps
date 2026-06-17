const mongoose = require("mongoose");

const CHANNELS = ["SLACK", "EMAIL", "WEBHOOK"];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      default: "INCIDENT_COUNT",
    },
    channel: {
      type: String,
      enum: CHANNELS,
      required: true,
    },
    threshold: {
      type: Number,
      required: true,
      default: 1,
    },
    destination: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    service: {
      type: String,
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: SEVERITIES,
      default: "HIGH",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Alert = mongoose.model("Alert", alertSchema);

module.exports = Alert;
