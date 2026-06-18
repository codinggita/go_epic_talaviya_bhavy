const express = require("express");

const router = express.Router();

const {
  verifyJWT,
  verifyAdmin,
} = require("../middleware/auth.middleware");

const {
  getAdminProblems,
  getAdminTopics,
  getAdminSolutions,
  getAdminDatasets,
  getAdminDashboard,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} = require("../controllers/admin.controller");

router.get(
  "/dashboard",
  verifyJWT,
  verifyAdmin,
  getAdminDashboard
);

router.get(
  "/problems",
  verifyJWT,
  verifyAdmin,
  getAdminProblems
);

router.get(
  "/topics",
  verifyJWT,
  verifyAdmin,
  getAdminTopics
);

router.get(
  "/solutions",
  verifyJWT,
  verifyAdmin,
  getAdminSolutions
);

router.get(
  "/datasets",
  verifyJWT,
  verifyAdmin,
  getAdminDatasets
);

// User CRUD routes
router.get(
  "/users",
  verifyJWT,
  verifyAdmin,
  getAdminUsers
);

router.post(
  "/users",
  verifyJWT,
  verifyAdmin,
  createAdminUser
);

router.put(
  "/users/:userId",
  verifyJWT,
  verifyAdmin,
  updateAdminUser
);

router.delete(
  "/users/:userId",
  verifyJWT,
  verifyAdmin,
  deleteAdminUser
);

module.exports = router;