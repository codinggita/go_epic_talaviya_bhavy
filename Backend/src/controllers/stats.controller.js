const Problem = require("../models/problem.model");
const Solution = require("../models/solution.model");
const asyncHandler = require("../utils/asyncHandler");

const getProblemStats = asyncHandler(async (req, res) => {
  const totalProblems = await Problem.countDocuments();
  res.status(200).json({ success: true, totalProblems });
});

const getTopicStats = asyncHandler(async (req, res) => {
  const uniqueTopics = await Problem.distinct("topic");
  res.status(200).json({ success: true, totalTopics: uniqueTopics.length });
});

const getDatasetStats = asyncHandler(async (req, res) => {
  const result = await Problem.aggregate([
    {
      $group: {
        _id: {
          source: "$dataset_source",
          topic: "$topic",
          difficulty: "$difficulty",
        },
      },
    },
    { $count: "count" },
  ]);
  res.status(200).json({ success: true, totalDatasets: result[0]?.count || 0 });
});

const getTotalSolutions = asyncHandler(async (req, res) => {
  const total = await Solution.countDocuments();
  res.status(200).json({ success: true, totalSolutions: total });
});

const getAdvancedProblemsStats = asyncHandler(async (req, res) => {
  // Count normalized "advanced" + raw "hard" / "difficult"
  const total = await Problem.countDocuments({
    difficulty: { $in: ["advanced", "hard", "difficult"] },
  });
  res.status(200).json({ success: true, totalAdvancedProblems: total });
});

const getTopicStatistics = asyncHandler(async (req, res) => {
  const { topic } = req.params;
  const totalProblems = await Problem.countDocuments({ topic });
  res.status(200).json({ success: true, topic, totalProblems });
});

const getSourceStatistics = asyncHandler(async (req, res) => {
  const { source } = req.params;
  const totalProblems = await Problem.countDocuments({ dataset_source: source });
  res.status(200).json({ success: true, source, totalProblems });
});

// Normalize raw difficulty values into easy/medium/advanced buckets
const getDifficultyStats = asyncHandler(async (req, res) => {
  const raw = await Problem.aggregate([
    { $group: { _id: "$difficulty", count: { $sum: 1 } } },
  ]);

  const normalize = (d) => {
    if (!d) return "medium";
    const v = d.toLowerCase();
    if (v === "easy" || v === "beginner") return "easy";
    if (v === "medium" || v === "intermediate") return "medium";
    if (v === "advanced" || v === "hard" || v === "difficult") return "advanced";
    return "medium";
  };

  const normalized = { easy: 0, medium: 0, advanced: 0 };
  raw.forEach(({ _id, count }) => {
    const bucket = normalize(_id);
    normalized[bucket] += count;
  });

  const data = Object.entries(normalized).map(([_id, count]) => ({ _id, count }));
  res.status(200).json({ success: true, data });
});

module.exports = {
  getProblemStats,
  getTopicStats,
  getDatasetStats,
  getTotalSolutions,
  getAdvancedProblemsStats,
  getTopicStatistics,
  getSourceStatistics,
  getDifficultyStats,
};