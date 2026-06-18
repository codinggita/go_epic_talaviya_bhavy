const express = require("express");
const router = express.Router();

const { searchProblems } = require("../controllers/problem.controller");
const { searchTopics } = require("../controllers/topic.controller");
const { searchSolutions } = require("../controllers/solution.controller");
const { searchDatasets } = require("../controllers/dataset.controller");

const { searchLimiter } = require("../middleware/rateLimit.middleware");

// Root search routes with search rate limiter
router.get("/problems", searchLimiter, searchProblems);
router.get("/topics", searchLimiter, searchTopics);
router.get("/solutions", searchLimiter, searchSolutions);
router.get("/datasets", searchLimiter, searchDatasets);

module.exports = router;