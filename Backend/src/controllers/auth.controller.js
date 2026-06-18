const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/user.model.js");

const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/apiError.js");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new ApiError(
      400,
      "User already exists"
    );
  }

  const hashedPassword =
    await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(
      400,
      "Email and password are required"
    );
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(
      401,
      "Invalid credentials"
    );
  }

  const isPasswordValid =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!isPasswordValid) {
    throw new ApiError(
      401,
      "Invalid credentials"
    );
  }

  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN,
    }
  );

  res.status(200).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  
  // If password change is requested, validate and hash it
  if (updates.password && updates.password.trim() !== "") {
    if (updates.password.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters");
    }
    updates.password = await bcrypt.hash(updates.password, 10);
  } else {
    // Prevent overriding password with empty string or omitting it
    delete updates.password;
  }

  // Prevent role hijacking via profile update
  delete updates.role;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");

  res.status(200).json({
    success: true,
    data: updatedUser,
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Logout successful. Remove token from client storage.",
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    message: "Account verified! Proceed to password reset.",
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    throw new ApiError(400, "Email and new password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});



const refreshToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, "Token is required");
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET,
    {
      ignoreExpiration: true,
    }
  );

  const newToken = jwt.sign(
    {
      userId: decoded.userId,
      role: decoded.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  res.status(200).json({
    success: true,
    token: newToken,
  });
});

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  logoutUser,
  forgotPassword,
  resetPassword,
  refreshToken,
};