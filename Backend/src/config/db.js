const mongoose = require("mongoose");

/**
 * Helper to safely obfuscate password in MongoDB URI for logs
 */
const getSafeMongoUri = (uri) => {
  if (!uri) return "undefined";
  try {
    // Replace credentials in mongodb+srv://user:pass@host/db format
    return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, "$1****$3");
  } catch (e) {
    return "Malformed URI (hidden for safety)";
  }
};

const connectDB = async (retries = 5, delay = 5000) => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error("CRITICAL ERROR: MONGO_URI is not defined in the environment variables (.env file)!");
    process.exit(1);
  }

  const safeUri = getSafeMongoUri(MONGO_URI);
  console.log(`[Database] Attempting connection to: ${safeUri}`);

  // Register event listeners once
  if (mongoose.connection.listeners("connected").length === 0) {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB Connected");
    });

    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB Connection Error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB Disconnected");
    });
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(MONGO_URI);
      console.log(`Database connection initialized successfully on attempt ${attempt}. Host: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`[Attempt ${attempt}/${retries}] MongoDB Connection Failure: ${error.message}`);
      
      if (attempt < retries) {
        console.log(`Retrying database connection in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error("CRITICAL: All database connection retries exhausted.");
        throw error; // Throw to let the server start in degraded mode
      }
    }
  }
};

module.exports = connectDB;
