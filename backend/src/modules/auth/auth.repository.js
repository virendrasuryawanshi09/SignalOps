const User = require("./auth.model");

class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
  }

  async findById(id) {
    return await User.findById(id).select("-password");
  }

  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async addRefreshToken(userId, token) {
    return await User.findByIdAndUpdate(
      userId,
      { $push: { refreshTokens: token } },
      { new: true }
    );
  }

  async removeRefreshToken(userId, token) {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { refreshTokens: token } },
      { new: true }
    );
  }

  async clearRefreshTokens(userId) {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { refreshTokens: [] } },
      { new: true }
    );
  }
}

module.exports = new UserRepository();
