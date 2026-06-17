const mongoose = require("mongoose");

const traceSchema = new mongoose.Schema(
  {
    traceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    serviceFlow: [
      {
        serviceName: { type: String, required: true },
        durationMs: { type: Number, required: true },
        status: { type: String, required: true },
      },
    ],
    failingNode: {
      type: String,
      default: "",
    },
    durationMs: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "DEGRADED"],
      default: "SUCCESS",
      index: true,
    },
    relatedIncident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incident",
      default: null,
    },
    startedAt: {
      type: Date,
      required: true,
      index: true,
    },
    endedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Trace = mongoose.model("Trace", traceSchema);

module.exports = Trace;
