const express = require("express");

const router = express.Router();

const {
  generateToken,
  verifyToken,
  refreshToken,
  jwtProfile,
  jwtDashboard,
  adminRoute,
  userRoute,
  checkAdminRole,
} = require("../controllers/jwt.controller");

const {
  verifyJWT,
  requireAdmin,
  requireUser,
} = require("../middleware/auth.middleware");

// Public token utilities
router.post("/generate-token", generateToken);
router.post("/verify-token", verifyToken);
router.post("/refresh-token", refreshToken);

// Protected — any authenticated user
router.get("/profile",   verifyJWT, jwtProfile);
router.get("/dashboard", verifyJWT, requireUser,  jwtDashboard);
router.get("/user",      verifyJWT, requireUser,  userRoute);

// Protected — admin only
router.get("/admin",            verifyJWT, requireAdmin, adminRoute);
router.get("/check-role/admin", verifyJWT, requireAdmin, checkAdminRole);

module.exports = router;