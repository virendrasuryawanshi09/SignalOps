const mongoose = require("mongoose");

const deploymentSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      required: true,
      trim: true,
    },
    commitSha: {
      type: String,
      required: true,
      trim: true,
    },
    environment: {
      type: String,
      required: true,
      default: "production",
      trim: true,
    },
    service: {
      type: String,
      required: true,
      trim: true,
    },
    deployedBy: {
      type: String,
      default: "CI/CD Pipeline",
      trim: true,
    },
    deployedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

deploymentSchema.index({ service: 1, deployedAt: -1 });
deploymentSchema.index({ version: 1 });

const Deployment = mongoose.model("Deployment", deploymentSchema);

module.exports = Deployment;
