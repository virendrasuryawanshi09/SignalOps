const mongoose = require("mongoose");

const DEFAULT_MONGO_URI = "mongodb://localhost:27017/signalops";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || DEFAULT_MONGO_URI;

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: Number(process.env.DB_CONNECT_TIMEOUT_MS) || 10000,
    });

    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log("MongoDB disconnected");
};

mongoose.connection.on("error", (error) => {
  console.error("MongoDB runtime error:", error.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

module.exports = {
  connectDB,
  disconnectDB,
};
