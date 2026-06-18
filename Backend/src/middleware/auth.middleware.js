const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

const verifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Access token required");
  }

  const token = authHeader.split(" ")[1];

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.userId).select("-password");

  if (!user) {
    throw new ApiError(401, "Invalid token");
  }

  req.user = user;

  next();
});

const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Admin access required");
  }

  next();
};

// Role middleware: only admin role allowed
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access required",
    });
  }
  next();
};

// Role middleware: user or admin allowed
const requireUser = (req, res, next) => {
  if (!req.user || !["user", "admin"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: User access required",
    });
  }
  next();
};

module.exports = {
  verifyJWT,
  verifyAdmin,
  requireAdmin,
  requireUser,
};