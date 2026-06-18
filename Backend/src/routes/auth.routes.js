const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  logoutUser,
  forgotPassword,
  resetPassword,
  refreshToken,
} = require("../controllers/auth.controller.js");

const validateUser = require("../middleware/validateUser.middleware.js");

const {
  loginLimiter,
  registerLimiter,
} = require("../middleware/rateLimit.middleware.js");

const { verifyJWT } = require("../middleware/auth.middleware");

router.post("/register", registerLimiter, validateUser, registerUser);

router.post("/login", loginLimiter, loginUser);

router.get("/profile", verifyJWT, getProfile);

router.patch("/profile", verifyJWT, updateProfile);

router.post("/logout", verifyJWT, logoutUser);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);



router.post("/refresh-token", refreshToken);

module.exports = router;