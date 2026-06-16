const http = require("http");
const dotenv = require("dotenv");
const { connectDB, disconnectDB } = require("./config/db");

const app = require("./app");
const socketManager = require("./sockets/socketManager");

dotenv.config();

const PORT = process.env.PORT || 8001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const server = http.createServer(app);

async function startServer() {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
      const errorMsg = "Environment configuration missing: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be defined.";
      if (isProduction) {
        throw new Error(errorMsg);
      } else {
        console.warn(`[Warning] ${errorMsg} Fallback default secrets will be used in development.`);
      }
    }

    await connectDB();

    socketManager.init(server, CLIENT_URL);

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
}

startServer();

const gracefulShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    console.log("[Server] HTTP server closed.");
  });

  try {
    await disconnectDB();
    console.log("[Server] Database connection closed cleanly.");
    process.exit(0);
  } catch (err) {
    console.error("[Server] Error disconnecting database:", err.message);
    process.exit(1);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
