const express = require("express");

const router = express.Router();

const {
  getProblemStats,
  getTopicStats,
  getDatasetStats,
  getTotalSolutions,
  getAdvancedProblemsStats,
  getTopicStatistics,
  getSourceStatistics,
  getDifficultyStats,
} = require("../controllers/stats.controller");

router.get("/problems", getProblemStats);

router.get("/topics", getTopicStats);

router.get("/datasets", getDatasetStats);

router.get("/total-solutions", getTotalSolutions);

router.get(
  "/advanced-problems",
  getAdvancedProblemsStats
);

router.get("/topic/:topic", getTopicStatistics);

router.get("/source/:source", getSourceStatistics);

router.get("/difficulties", getDifficultyStats);

module.exports = router;