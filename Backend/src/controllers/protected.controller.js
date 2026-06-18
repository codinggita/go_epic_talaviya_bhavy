const Problem = require("../models/problem.model");
const Topic = require("../models/topic.model");
const Solution = require("../models/solution.model");
const Dataset = require("../models/dataset.model");

const asyncHandler = require("../utils/asyncHandler");

const getProtectedProblems = asyncHandler(async (req, res) => {
  const problems = await Problem.find();

  res.status(200).json({
    success: true,
    data: problems,
  });
});

const getProtectedTopics = asyncHandler(async (req, res) => {
  const topics = await Topic.find();

  res.status(200).json({
    success: true,
    data: topics,
  });
});

const getProtectedSolutions = asyncHandler(async (req, res) => {
  const solutions = await Solution.find();

  res.status(200).json({
    success: true,
    data: solutions,
  });
});

const getProtectedDatasets = asyncHandler(async (req, res) => {
  const datasets = await Dataset.find();

  res.status(200).json({
    success: true,
    data: datasets,
  });
});

module.exports = {
  getProtectedProblems,
  getProtectedTopics,
  getProtectedSolutions,
  getProtectedDatasets,
};