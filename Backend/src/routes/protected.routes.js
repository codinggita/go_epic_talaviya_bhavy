const express = require("express");

const router = express.Router();

const {
  verifyJWT,
} = require("../middleware/auth.middleware");

const {
  getProtectedProblems,
  getProtectedTopics,
  getProtectedSolutions,
  getProtectedDatasets,
} = require("../controllers/protected.controller");

router.get(
  "/problems",
  verifyJWT,
  getProtectedProblems
);

router.get(
  "/topics",
  verifyJWT,
  getProtectedTopics
);

router.get(
  "/solutions",
  verifyJWT,
  getProtectedSolutions
);

router.get(
  "/datasets",
  verifyJWT,
  getProtectedDatasets
);

module.exports = router;