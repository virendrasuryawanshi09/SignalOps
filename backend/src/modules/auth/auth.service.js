const crypto = require("crypto");
const userRepository = require("./auth.repository");
const User = require("./auth.model");
const jwt = require("../../utils/jwt");

class AuthService {
  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || "access_secret";
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || "refresh_secret";

    this.accessTokenExpiry = 15 * 60;
    this.refreshTokenExpiry = 7 * 24 * 60 * 60;
  }

  async register({ name, email, password, role }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("Registration failed: Email address is already registered");
    }

    const hashedPassword = User.hashPassword(password);
    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: role || "DEVELOPER",
    });

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Login failed: Invalid email credentials");
    }

    const isMatch = User.comparePassword(password, user.password);
    if (!isMatch) {
      throw new Error("Login failed: Invalid password credentials");
    }

    const tokens = this.generateAuthTokens(user);


    await userRepository.addRefreshToken(user._id, tokens.refreshToken);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async logout(userId, refreshToken) {
    await userRepository.removeRefreshToken(userId, refreshToken);
    return true;
  }

  async refreshUserToken(token) {
    const payload = jwt.verify(token, this.refreshTokenSecret);
    if (!payload) {
      throw new Error("Refresh failed: Token signature is invalid or expired");
    }

    const user = await userRepository.findByEmail(payload.email);
    if (!user || !user.refreshTokens.includes(token)) {

      if (user) await userRepository.clearRefreshTokens(user._id);
      throw new Error("Refresh failed: Token reuse detected or invalid session state");
    }


    await userRepository.removeRefreshToken(user._id, token);
    const tokens = this.generateAuthTokens(user);
    await userRepository.addRefreshToken(user._id, tokens.refreshToken);

    return tokens;
  }

  generateAuthTokens(user) {
    const tokenPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(tokenPayload, this.accessTokenSecret, this.accessTokenExpiry);
    const refreshToken = jwt.sign(tokenPayload, this.refreshTokenSecret, this.refreshTokenExpiry);

    return {
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return { success: true, message: "If that email exists, a reset token has been generated." };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000);

    await userRepository.savePasswordResetToken(user._id, resetToken, expiresAt);

    return {
      success: true,
      message: "Password reset token generated successfully",
      resetToken,
    };
  }

  async resetPassword(token, newPassword) {
    if (!token || !newPassword) {
      throw new Error("Password reset failed: Reset token and new password are required");
    }

    const user = await userRepository.findByResetToken(token);
    if (!user) {
      throw new Error("Password reset failed: Reset token is invalid or has expired");
    }

    const hashedPassword = User.hashPassword(newPassword);
    await userRepository.updatePasswordAndClearToken(user._id, hashedPassword);

    return {
      success: true,
      message: "Password has been reset successfully",
    };
  }
}

module.exports = new AuthService();
