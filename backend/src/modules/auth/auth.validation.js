const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registerSchema = {
  name: {
    required: true,
    type: "string",
  },
  email: {
    required: true,
    type: "string",
    pattern: emailRegex,
  },
  password: {
    required: true,
    type: "string",
  },
  role: {
    required: false,
    type: "string",
    enum: ["ADMIN", "DEVELOPER", "VIEWER"],
  },
};

const loginSchema = {
  email: {
    required: true,
    type: "string",
    pattern: emailRegex,
  },
  password: {
    required: true,
    type: "string",
  },
};

module.exports = {
  registerSchema,
  loginSchema,
};
