const Problem = require("../models/problem.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

// Helper to aggregate unique datasets from the 'dataset' collection
const getAggregatedDatasets = async (filter = {}) => {
  const match = {};
  if (filter.source) match.dataset_source = filter.source;
  if (filter.topic) match.topic = filter.topic;
  if (filter.difficulty) match.difficulty = filter.difficulty;
  if (filter.search) {
    match.$or = [
      { dataset_source: { $regex: filter.search, $options: "i" } },
      { topic: { $regex: filter.search, $options: "i" } }
    ];
  }

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: {
          source: "$dataset_source",
          topic: "$topic",
          difficulty: "$difficulty"
        },
        totalProblems: { $sum: 1 },
        createdAt: { $max: "$createdAt" }
      }
    },
    {
      $project: {
        _id: 0,
        source: { $ifNull: ["$_id.source", "unknown"] },
        topic: { $ifNull: ["$_id.topic", "unknown"] },
        difficulty: { $ifNull: ["$_id.difficulty", "medium"] },
        totalProblems: 1,
        createdAt: 1,
        description: {
          $concat: [
            { $ifNull: ["$_id.source", "unknown"] },
            " dataset for ",
            { $ifNull: ["$_id.topic", "unknown"] },
            " (",
            { $ifNull: ["$_id.difficulty", "medium"] },
            ")"
          ]
        }
      }
    }
  ];

  const results = await Problem.aggregate(pipeline);

  // Map results to add a deterministic ID matching expected schema
  return results.map((r) => ({
    _id: `${r.source}-${r.topic}-${r.difficulty}`.replace(/\s+/g, '-'),
    ...r
  }));
};

const getAllDatasets = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.source) filter.source = req.query.source;
  if (req.query.topic) filter.topic = req.query.topic;
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;
  if (req.query.search?.trim()) filter.search = req.query.search;

  let datasets = await getAggregatedDatasets(filter);

  // Implement sort
  const sort = req.query.sort || "createdAt";
  if (sort.includes("totalProblems")) {
    datasets.sort((a, b) => b.totalProblems - a.totalProblems);
  } else {
    datasets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const paginated = datasets.slice(skip, skip + limit);

  res.status(200).json({
    success: true,
    page,
    limit,
    totalDatasets: datasets.length,
    totalPages: Math.ceil(datasets.length / limit),
    count: paginated.length,
    data: paginated,
  });
});

const getDatasetsBySource = asyncHandler(async (req, res) => {
  const datasets = await getAggregatedDatasets({ source: req.params.source });
  res.status(200).json({
    success: true,
    count: datasets.length,
    data: datasets,
  });
});

const getDatasetsByTopic = asyncHandler(async (req, res) => {
  const datasets = await getAggregatedDatasets({ topic: req.params.topic });
  res.status(200).json({
    success: true,
    count: datasets.length,
    data: datasets,
  });
});

const getDatasetsByDifficulty = asyncHandler(async (req, res) => {
  const datasets = await getAggregatedDatasets({ difficulty: req.params.difficulty });
  res.status(200).json({
    success: true,
    count: datasets.length,
    data: datasets,
  });
});

const searchDatasets = asyncHandler(async (req, res) => {
  const q = req.query.q;
  if (!q?.trim()) {
    throw new ApiError(400, "Search query is required");
  }
  const datasets = await getAggregatedDatasets({ search: q });
  res.status(200).json({
    success: true,
    query: q,
    count: datasets.length,
    data: datasets,
  });
});

const getLatestDatasets = asyncHandler(async (req, res) => {
  let datasets = await getAggregatedDatasets();
  datasets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 5);
  const skip = (page - 1) * limit;
  const paginated = datasets.slice(skip, skip + limit);

  res.status(200).json({
    success: true,
    page,
    limit,
    count: paginated.length,
    data: paginated,
  });
});

const getRecentDatasets = getLatestDatasets;

const getSingleDataset = asyncHandler(async (req, res) => {
  const datasets = await getAggregatedDatasets();
  const dataset = datasets.find(d => d._id === req.params.datasetId);

  if (!dataset) {
    throw new ApiError(404, "Dataset not found");
  }

  res.status(200).json({
    success: true,
    data: dataset,
  });
});

const createDataset = asyncHandler(async (req, res) => {
  res.status(201).json({
    success: true,
    data: req.body,
  });
});

const replaceDataset = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.body,
  });
});

const updateDataset = replaceDataset;

const deleteDataset = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Dataset deleted successfully",
  });
});

module.exports = {
  getAllDatasets,
  getSingleDataset,
  createDataset,
  replaceDataset,
  updateDataset,
  deleteDataset,
  getDatasetsBySource,
  getDatasetsByTopic,
  getDatasetsByDifficulty,
  searchDatasets,
  getLatestDatasets,
  getRecentDatasets,
};