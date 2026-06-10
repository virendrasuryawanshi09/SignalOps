const authService = require("./auth.service");

class AuthController {
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;
      const user = await authService.register({ name, email, password, role });

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error) {
      return res.status(error.message.includes("registered") ? 400 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await authService.login(email, password);


      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user,
          accessToken,
        },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  async logout(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

      if (refreshToken && req.user) {
        await authService.logout(req.user.id, refreshToken);
      }

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async refresh(req, res) {
    try {
      const token = req.cookies?.refreshToken || req.body.refreshToken;
      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Refresh token is missing",
        });
      }

      const { accessToken, refreshToken } = await authService.refreshUserToken(token);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        data: {
          accessToken,
        },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AuthController();
