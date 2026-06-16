const cors = require("cors");
const express = require("express");
const logRoutes = require("./modules/logs/log.routes");
const authRoutes = require("./modules/auth/auth.routes");
const analyticsRoutes = require("./modules/analytics/analytics.routes");
const deploymentRoutes = require("./modules/deployments/deployment.routes");

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());


app.use((req, res, next) => {
  req.cookies = {};
  const rawCookies = req.headers.cookie;
  if (rawCookies) {
    rawCookies.split(";").forEach((cookie) => {
      const equalIndex = cookie.indexOf("=");
      if (equalIndex === -1) return;
      
      const key = cookie.substring(0, equalIndex).trim();
      const val = cookie.substring(equalIndex + 1).trim();
      
      try {
        req.cookies[key] = decodeURIComponent(val);
      } catch (e) {
        req.cookies[key] = val;
      }
    });
  }
  next();
});

app.get("/", (req, res) => {
  res.json({
    name: "SignalOps API",
    status: "running",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to the SignalOps API",
  });
});


app.use("/api/logs", logRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/deployments", deploymentRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  
  if (status >= 500) {
    console.error(`[Error Handler] ${err.stack || err.message || err}`);
  }

  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === "production" && status >= 500
      ? "Internal server error"
      : err.message || "An unexpected error occurred",
  });
});

module.exports = app;
