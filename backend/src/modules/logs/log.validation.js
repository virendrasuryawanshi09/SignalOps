const ingestLogSchema = {
  service: {
    required: true,
    type: "string",
  },
  message: {
    required: true,
    type: "string",
  },
  source: {
    required: true,
    type: "string",
    enum: ["FRONTEND", "BACKEND", "DATABASE", "API", "SYSTEM"],
  },
  severity: {
    required: false,
    type: "string",
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
  },
  environment: {
    required: false,
    type: "string",
  },
  stackTrace: {
    required: false,
    type: "string",
  },
  traceId: {
    required: false,
    type: "string",
  },
};

module.exports = {
  ingestLogSchema,
};
