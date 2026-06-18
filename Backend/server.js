const path = require("path");
const dotenv = require("dotenv");

// Load environment variables relative to this file's root directory
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

// Connect to Database, then start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("WARNING: Database connection failed during startup. Running server in DEGRADED mode.");
    console.error(`Error details: ${err.message}`);
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (DEGRADED mode - database offline)`);
    });
  });