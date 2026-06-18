const express = require("express");
const mongoose = require("mongoose");
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

app.use("/problems", problemRoutes);
app.use("/topics", topicRoutes);
app.use("/solutions", solutionRoutes);
app.use("/datasets", datasetRoutes);
app.use("/stats", statsRoutes);
app.use("/auth", authRoutes);
app.use("/jwt", jwtRoutes);
app.use("/admin", adminRoutes);
app.use("/protected", protectedRoutes);
app.use("/search", searchRoutes);
app.use("/", systemRoutes);
app.use(errorMiddleware);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

module.exports = app;