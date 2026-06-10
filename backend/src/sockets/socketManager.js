const { Server } = require("socket.io");

class SocketManager {
  constructor() {
    this.io = null;
  }

  /**
   * Initializes the Socket.io server bound to the provided HTTP server.
   *
   * @param {Object} httpServer - Node HTTP server instance
   * @param {string} clientUrl - Authorized origin URL for CORS
   */
  init(httpServer, clientUrl = "http://localhost:5173") {
    this.io = new Server(httpServer, {
      cors: {
        origin: clientUrl,
        credentials: true,
      },
    });

    this.io.on("connection", (socket) => {
      console.log(`[Socket.io] New client connected: ${socket.id}`);

      // Basic client registration and rooms routing
      socket.on("dashboard:join", () => {
        socket.join("dashboard:logs");
        console.log(`[Socket.io] Client ${socket.id} joined dashboard logs room`);
      });

      socket.on("dashboard:leave", () => {
        socket.leave("dashboard:logs");
        console.log(`[Socket.io] Client ${socket.id} left dashboard logs room`);
      });

      socket.on("disconnect", (reason) => {
        console.log(`[Socket.io] Client disconnected: ${socket.id} (${reason})`);
      });
    });

    return this.io;
  }

  /**
   * Emits a real-time event to a target room or globally.
   *
   * @param {string} event - Event name
   * @param {Object} data - Payload details
   * @param {string} [room] - Target room name (optional)
   */
  emit(event, data, room = null) {
    if (!this.io) {
      console.warn("[Socket.io] Warning: Attempted to emit event before server initialization");
      return;
    }

    if (room) {
      this.io.to(room).emit(event, data);
    } else {
      this.io.emit(event, data);
    }
  }
}

module.exports = new SocketManager();
