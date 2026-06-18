const Solution = require("../models/solution.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

const getAllSolutions = asyncHandler(async (req, res) => {
  const filter = {};
  const sort = req.query.sort || "-createdAt";
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  if (req.query.difficulty) filter.difficulty = req.query.difficulty;
  if (req.query.topic) filter.topic = req.query.topic;
  // Map 'source' query param to 'dataset_source' field
  if (req.query.source) filter.dataset_source = req.query.source;

  if (req.query.keyword) {
    filter.$or = [
      { instruction: { $regex: req.query.keyword, $options: "i" } },
      { topic: { $regex: req.query.keyword, $options: "i" } },
    ];
  }

  const [solutions, totalSolutions] = await Promise.all([
    Solution.find(filter).sort(sort).skip(skip).limit(limit),
    Solution.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    page,
    limit,
    totalSolutions,
    totalPages: Math.ceil(totalSolutions / limit),
    count: solutions.length,
    data: solutions,
  });
});

const getSolutionsByTopic = asyncHandler(async (req, res) => {
  const solutions = await Solution.find({ topic: req.params.topic });
  res.status(200).json({
    success: true,
    count: solutions.length,
    data: solutions,
  });
});

const getSolutionsByDifficulty = asyncHandler(async (req, res) => {
  const solutions = await Solution.find({ difficulty: req.params.difficulty });
  res.status(200).json({
    success: true,
    count: solutions.length,
    data: solutions,
  });
});

const getSolutionsBySource = asyncHandler(async (req, res) => {
  const solutions = await Solution.find({ dataset_source: req.params.source });
  res.status(200).json({
    success: true,
    count: solutions.length,
    data: solutions,
  });
});

const searchSolutions = asyncHandler(async (req, res) => {
  const q = req.query.q;
  if (!q?.trim()) throw new ApiError(400, "Search query is required");

  const solutions = await Solution.find({
    $or: [
      { instruction: { $regex: q, $options: "i" } },
      { topic: { $regex: q, $options: "i" } },
      { output: { $regex: q, $options: "i" } },
    ],
  });

  res.status(200).json({
    success: true,
    query: q,
    count: solutions.length,
    data: solutions,
  });
});

const getRecentSolutions = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 5);
  const skip = (page - 1) * limit;

  const solutions = await Solution.find().sort("-createdAt").skip(skip).limit(limit);

  res.status(200).json({
    success: true,
    page,
    limit,
    count: solutions.length,
    data: solutions,
  });
});

const getSingleSolution = asyncHandler(async (req, res) => {
  const solution = await Solution.findByIdAndUpdate(
    req.params.solutionId,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!solution) throw new ApiError(404, "Solution not found");

  res.status(200).json({
    success: true,
    data: solution,
  });
});

const createSolution = asyncHandler(async (req, res) => {
  const { instruction, topic, difficulty, output, dataset_source } = req.body;
  const newSolution = await Solution.create({
    instruction: instruction || req.body.title || req.body.explanation,
    topic,
    difficulty,
    output: output || req.body.code || "",
    dataset_source: dataset_source || req.body.source || "manual",
  });

  res.status(201).json({
    success: true,
    data: newSolution,
  });
});

const replaceSolution = asyncHandler(async (req, res) => {
  const updatedSolution = await Solution.findByIdAndUpdate(
    req.params.solutionId,
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedSolution) throw new ApiError(404, "Solution not found");

  res.status(200).json({
    success: true,
    data: updatedSolution,
  });
});

const updateSolution = replaceSolution;

const deleteSolution = asyncHandler(async (req, res) => {
  const deleted = await Solution.findByIdAndDelete(req.params.solutionId);
  if (!deleted) throw new ApiError(404, "Solution not found");

  res.status(200).json({
    success: true,
    message: "Solution deleted successfully",
  });
});

const getRandomSolution = asyncHandler(async (req, res) => {
  const count = await Solution.countDocuments();
  if (count === 0) throw new ApiError(404, "No solutions found");
  const random = Math.floor(Math.random() * count);
  const solution = await Solution.findOne().skip(random);
  res.status(200).json({ success: true, data: solution });
});

const getTrendingSolutions = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const solutions = await Solution.find()
    .sort("-views -createdAt")
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    page,
    limit,
    count: solutions.length,
    data: solutions,
  });
});

module.exports = {
  getAllSolutions,
  getSingleSolution,
  createSolution,
  replaceSolution,
  updateSolution,
  deleteSolution,
  getSolutionsByTopic,
  getSolutionsByDifficulty,
  getSolutionsBySource,
  searchSolutions,
  getRecentSolutions,
  getRandomSolution,
  getTrendingSolutions,
};