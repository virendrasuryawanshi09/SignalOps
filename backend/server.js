const http = require("http");

const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const pino = require("pino");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

const PORT = process.env.PORT || 8000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

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

app.get("/ready", (req, res) => {
  const mongoConnected = mongoose.connection.readyState === 1;

  res.status(!MONGO_URI || mongoConnected ? 200 : 503).json({
    status: !MONGO_URI || mongoConnected ? "ready" : "not_ready",
    database: MONGO_URI ? (mongoConnected ? "connected" : "disconnected") : "not_configured",
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to the SignalOps API",
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

app.use((err, req, res, next) => {
  logger.error({ err }, "Unhandled request error");

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    logger.error(`Port ${PORT} is already in use. Stop the other process or set a different PORT in .env.`);
    process.exit(1);
  }

  logger.error({ err }, "Server error");
  process.exit(1);
});

io.on("connection", (socket) => {
  logger.info({ socketId: socket.id }, "Socket connected");

  socket.emit("server:ready", {
    message: "Connected to SignalOps realtime server",
  });

  socket.on("disconnect", (reason) => {
    logger.info({ socketId: socket.id, reason }, "Socket disconnected");
  });
});

async function startServer() {
  try {
    if (MONGO_URI) {
      await mongoose.connect(MONGO_URI);
      console.log("Connected to MongoDB");
    } else {
      logger.warn("MONGO_URI is not set; starting without a database connection");
    }

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  logger.info("Shutting down server");
  await mongoose.connection.close();
  server.close(() => process.exit(0));
});

startServer();
