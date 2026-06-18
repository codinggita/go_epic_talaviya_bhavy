const errorMiddleware = (err, req, res, next) => {
    console.log(err);

    // DUPLICATE KEY ERROR
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate field value entered",
    });
  }

  // INVALID MONGODB OBJECT ID
if (err.name === "CastError") {
  return res.status(400).json({
    success: false,
    message: "Invalid resource ID",
  });
}

    res.status(err.statusCode || 500).json({
        success : false,
        message : err.message || "Internal Sever Error",
    });
};

module.exports = errorMiddleware;