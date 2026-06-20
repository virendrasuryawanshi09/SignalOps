const crypto = require("crypto");
const mongoose = require("mongoose");

const ROLES = ["ADMIN", "DEVELOPER", "VIEWER"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ROLES,
      default: "DEVELOPER",
    },
    refreshTokens: {
      type: [String],
      default: [],
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


userSchema.statics.hashPassword = function (password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

userSchema.statics.comparePassword = function (password, storedHash) {
  const [salt, hash] = storedHash.split(":");
  const testHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return testHash === hash;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
