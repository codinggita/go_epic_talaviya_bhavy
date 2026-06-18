const mongoose = require("mongoose");
const packageJson = require("../../package.json");
const Problem = require("../models/problem.model");
const Topic = require("../models/topic.model");
const Solution = require("../models/solution.model");
const Dataset = require("../models/dataset.model");
const asyncHandler = require("../utils/asyncHandler");

// GET /health
const getHealth = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// GET /version
const getVersion = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    projectName: packageJson.name,
    version: packageJson.version,
  });
});

// GET /metrics
const getMetrics = asyncHandler(async (req, res) => {
  const [totalProblems, totalTopics, totalSolutions, totalDatasets] = await Promise.all([
    Problem.countDocuments(),
    Topic.countDocuments(),
    Solution.countDocuments(),
    Dataset.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    totalProblems,
    totalTopics,
    totalSolutions,
    totalDatasets,
  });
});

// GET /server-status
const getServerStatus = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    memoryUsage: process.memoryUsage(),
    nodeVersion: process.version,
    uptime: process.uptime(),
  });
});

module.exports = {
  getHealth,
  getVersion,
  getMetrics,
  getServerStatus,
};