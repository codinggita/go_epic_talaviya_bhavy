const Problem = require("../models/problem.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

const getAllProblems = asyncHandler(async (req, res) => {
  const filter = {};
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;
  const sort = req.query.sort || "-createdAt";

  if (req.query.difficulty) {
    filter.difficulty = req.query.difficulty;
  }

  if (req.query.topic) {
    filter.topic = req.query.topic;
  }

  // 'dataset_source' is the real field name in the dataset collection
  if (req.query.source) {
    filter.dataset_source = req.query.source;
  }

  if (req.query.keyword) {
    filter.$or = [
      { instruction: { $regex: req.query.keyword, $options: "i" } },
      { topic: { $regex: req.query.keyword, $options: "i" } },
    ];
  }

  const [problems, totalProblems] = await Promise.all([
    Problem.find(filter).sort(sort).skip(skip).limit(limit),
    Problem.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    page,
    limit,
    sort,
    totalProblems,
    totalPages: Math.ceil(totalProblems / limit),
    count: problems.length,
    data: problems,
  });
});

const getSingleProblem = asyncHandler(async (req, res) => {
  const problem = await Problem.findByIdAndUpdate(
    req.params.problemId,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  res.status(200).json({
    success: true,
    data: problem,
  });
});

const createProblem = asyncHandler(async (req, res) => {
  const { instruction, topic, difficulty, output, dataset_source } = req.body;
  const newProblem = await Problem.create({
    instruction: instruction || req.body.title,
    topic,
    difficulty,
    output,
    dataset_source,
  });

  res.status(201).json({
    success: true,
    data: newProblem,
  });
});

const replaceProblem = asyncHandler(async (req, res) => {
  const updatedProblem = await Problem.findByIdAndUpdate(
    req.params.problemId,
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedProblem) {
    throw new ApiError(404, "Problem not found");
  }

  res.status(200).json({
    success: true,
    data: updatedProblem,
  });
});

const updateProblem = replaceProblem;

const deleteProblem = asyncHandler(async (req, res) => {
  const deletedProblem = await Problem.findByIdAndDelete(req.params.problemId);

  if (!deletedProblem) {
    throw new ApiError(404, "Problem not found");
  }

  res.status(200).json({
    success: true,
    message: "Problem deleted successfully",
  });
});

const searchProblems = asyncHandler(async (req, res) => {
  const q = req.query.q;

  if (!q?.trim()) {
    throw new ApiError(400, "Search query is required");
  }

  const problems = await Problem.find({
    $or: [
      { instruction: { $regex: q, $options: "i" } },
      { topic: { $regex: q, $options: "i" } },
    ],
  });

  res.status(200).json({
    success: true,
    query: q,
    count: problems.length,
    data: problems,
  });
});

const getProblemsByTopic = asyncHandler(async (req, res) => {
  const problems = await Problem.find({ topic: req.params.topic });
  res.status(200).json({
    success: true,
    count: problems.length,
    data: problems,
  });
});

const getProblemsByDifficulty = asyncHandler(async (req, res) => {
  const problems = await Problem.find({ difficulty: req.params.difficulty });
  res.status(200).json({
    success: true,
    count: problems.length,
    data: problems,
  });
});

const getProblemsBySource = asyncHandler(async (req, res) => {
  const problems = await Problem.find({ dataset_source: req.params.source });
  res.status(200).json({
    success: true,
    count: problems.length,
    data: problems,
  });
});

const getProblemsByInstructionKeyword = asyncHandler(async (req, res) => {
  const problems = await Problem.find({
    instruction: { $regex: req.params.keyword, $options: "i" },
  });
  res.status(200).json({
    success: true,
    count: problems.length,
    data: problems,
  });
});

const getRandomProblem = asyncHandler(async (req, res) => {
  const count = await Problem.countDocuments();
  if (count === 0) throw new ApiError(404, "No problems found");
  const random = Math.floor(Math.random() * count);
  const problem = await Problem.findOne().skip(random);
  res.status(200).json({
    success: true,
    data: problem,
  });
});

const getTrendingProblems = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const problems = await Problem.find()
    .sort("-views -createdAt")
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    page,
    limit,
    count: problems.length,
    data: problems,
  });
});

const getRecentProblems = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const problems = await Problem.find()
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    page,
    limit,
    count: problems.length,
    data: problems,
  });
});

const getAdvancedProblems = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 5);
  const skip = (page - 1) * limit;

  const problems = await Problem.find({ difficulty: "advanced" })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    page,
    limit,
    count: problems.length,
    data: problems,
  });
});

const importProblems = asyncHandler(async (req, res) => {
  let problemsArray = req.body;
  if (!Array.isArray(problemsArray) && req.body && Array.isArray(req.body.problems)) {
    problemsArray = req.body.problems;
  }

  if (!Array.isArray(problemsArray) || problemsArray.length === 0) {
    throw new ApiError(400, "Please provide an array of problems to import");
  }

  const normalizeDifficulty = (d) => {
    if (!d) return "medium";
    const v = d.toLowerCase();
    if (v === "beginner" || v === "easy") return "easy";
    if (v === "intermediate" || v === "medium") return "medium";
    if (v === "hard" || v === "advanced" || v === "difficult") return "advanced";
    return "medium";
  };

  const problemsToInsert = [];
  const errors = [];

  for (let i = 0; i < problemsArray.length; i++) {
    const item = problemsArray[i];
    const instruction = item.instruction || item.description || item.title;
    const topic = item.topic || item.category;

    if (!instruction) {
      errors.push({ index: i, error: "instruction or description is required" });
      continue;
    }
    if (!topic) {
      errors.push({ index: i, error: "topic or category is required" });
      continue;
    }

    problemsToInsert.push({
      instruction: instruction.trim(),
      topic: topic.trim(),
      difficulty: normalizeDifficulty(item.difficulty),
      output: item.output || item.code || "",
      dataset_source: item.dataset_source || item.source || "manual-import",
      views: 0,
    });
  }

  if (problemsToInsert.length === 0) {
    throw new ApiError(400, "No valid problems found to import");
  }

  const importedProblems = await Problem.insertMany(problemsToInsert);

  res.status(201).json({
    success: true,
    message: `Successfully imported ${importedProblems.length} problems`,
    count: importedProblems.length,
    failedCount: errors.length,
    errors: errors.length > 0 ? errors : undefined,
    data: importedProblems,
  });
});

module.exports = {
  getAllProblems,
  getSingleProblem,
  createProblem,
  replaceProblem,
  updateProblem,
  deleteProblem,
  searchProblems,
  getProblemsByTopic,
  getProblemsByDifficulty,
  getProblemsBySource,
  getProblemsByInstructionKeyword,
  getRandomProblem,
  getTrendingProblems,
  getRecentProblems,
  getAdvancedProblems,
  importProblems,
};