const mongoose = require("mongoose");
const dotenv = require("dotenv");


dotenv.config();

const TEST_MONGO_URI = process.env.TEST_MONGO_URI || "mongodb://localhost:27017/signalops_test";

beforeAll(async () => {

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_MONGO_URI);
  }
});

afterEach(async () => {

  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  // Disconnect cleanly
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});
