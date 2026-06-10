const http = require("http");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const app = require("./app");
const socketManager = require("./sockets/socketManager");

dotenv.config();

const PORT = process.env.PORT || 8001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const server = http.createServer(app);

async function startServer() {
  try {
    if (MONGO_URI) {
      await mongoose.connect(MONGO_URI);
      console.log("Connected to MongoDB");
    }

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
