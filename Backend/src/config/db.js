const mongoose = require("mongoose");

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error("CRITICAL ERROR: MONGO_URI is not defined in the environment variables (.env file)!");
    process.exit(1);
  }

  // Setup connection event listeners before connecting
  mongoose.connection.on("connected", () => {
    console.log(`MongoDB Connected successfully to database: ${mongoose.connection.name}`);
  });

  mongoose.connection.on("error", (err) => {
    console.error(`MongoDB Connection Error event: ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB Disconnected.");
  });

  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`Database initialized. Host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Failure during startup: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
