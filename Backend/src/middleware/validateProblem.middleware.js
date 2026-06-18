const ApiError = require("../utils/apiError");

const validateProblem = (req, res, next) => {
  const { title, difficulty, topic, source, instruction } = req.body;

  if (!title || title.trim() === "") {
    throw new ApiError(400, "Title is required");
  }

  if (!difficulty || difficulty.trim() === "") {
    throw new ApiError(400, "Difficulty is required");
  }

  if (!topic || topic.trim() === "") {
    throw new ApiError(400, "Topic is required");
  }

  if (!source || source.trim() === "") {
    throw new ApiError(400, "Source is required");
  }

  if (!instruction || instruction.trim() === "") {
    throw new ApiError(400, "Instruction is required");
  }

  next();
};

module.exports = validateProblem;