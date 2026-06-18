const express = require("express");
const router = express.Router();
const {
  getHealth,
  getVersion,
  getMetrics,
  getServerStatus,
} = require("../controllers/system.controller");

router.get("/health", getHealth);
router.get("/version", getVersion);
router.get("/metrics", getMetrics);
router.get("/server-status", getServerStatus);

module.exports = router;