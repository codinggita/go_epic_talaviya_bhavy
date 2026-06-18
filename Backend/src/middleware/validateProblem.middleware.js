const ApiError = require("../utils/apiError");

const validateProblem = (req, res, next) => {
  // Support both instruction/title and dataset_source/source formats
  const instruction = req.body.instruction || req.body.title;
  const topic = req.body.topic;
  const difficulty = req.body.difficulty;
  const dataset_source = req.body.dataset_source || req.body.source;

  if (!instruction || String(instruction).trim() === "") {
    throw new ApiError(400, "Instruction or title is required");
  }

  if (!topic || String(topic).trim() === "") {
    throw new ApiError(400, "Topic is required");
  }

  if (!difficulty || String(difficulty).trim() === "") {
    throw new ApiError(400, "Difficulty is required");
  }

  if (!dataset_source || String(dataset_source).trim() === "") {
    throw new ApiError(400, "Source or dataset_source is required");
  }

  // Map normalized fields back to body so controllers receive standard fields
  req.body.instruction = String(instruction).trim();
  req.body.title = String(instruction).trim();
  req.body.topic = String(topic).trim();
  req.body.difficulty = String(difficulty).trim();
  req.body.dataset_source = String(dataset_source).trim();
  req.body.source = String(dataset_source).trim();

  next();
};

module.exports = validateProblem;