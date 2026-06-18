const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const problemRoutes = require("./routes/problem.routes");
const topicRoutes = require("./routes/topic.routes");
const solutionRoutes = require("./routes/solution.routes");
const datasetRoutes = require("./routes/dataset.routes");
const statsRoutes = require("./routes/stats.routes");
const authRoutes = require("./routes/auth.routes");
const jwtRoutes = require("./routes/jwt.routes");
const adminRoutes = require("./routes/admin.routes");
const protectedRoutes = require("./routes/protected.routes");
const systemRoutes = require("./routes/system.routes");
const searchRoutes = require("./routes/search.routes");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Register routes under multiple prefixes to prevent 404 errors regardless of client configuration
const registerRoutes = (prefix = "") => {
  app.use(`${prefix}/problems`, problemRoutes);
  app.use(`${prefix}/topics`, topicRoutes);
  app.use(`${prefix}/solutions`, solutionRoutes);
  app.use(`${prefix}/datasets`, datasetRoutes);
  app.use(`${prefix}/stats`, statsRoutes);
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/jwt`, jwtRoutes);
  app.use(`${prefix}/admin`, adminRoutes);
  app.use(`${prefix}/protected`, protectedRoutes);
  app.use(`${prefix}/search`, searchRoutes);
  app.use(`${prefix}/`, systemRoutes);
};

registerRoutes("/api/v1");
registerRoutes("/api");
registerRoutes("");

app.use(errorMiddleware);

module.exports = app;