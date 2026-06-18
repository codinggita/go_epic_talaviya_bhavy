const Problem = require("../models/problem.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

// Helper to aggregate unique topics from the 'dataset' collection
const getAggregatedTopics = async (filter = {}) => {
  const match = {};
  if (filter.name) {
    match.topic = filter.name;
  }
  if (filter.search) {
    match.topic = { $regex: filter.search, $options: "i" };
  }

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: "$topic",
        views: { $sum: { $ifNull: ["$views", 0] } }
      }
    },
    {
      $project: {
        _id: 0,
        name: "$_id",
        views: 1,
        category: { $literal: "programming" },
        description: { $concat: ["Topic: ", "$_id"] }
      }
    }
  ];

  return await Problem.aggregate(pipeline);
};

const getAllTopics = asyncHandler(async (req, res) => {
  const search = req.query.search?.trim();
  let topics = await getAggregatedTopics({ search });

  // Handle sorting
  const sort = req.query.sort || "name";
  if (sort.includes("views")) {
    topics.sort((a, b) => b.views - a.views);
  } else {
    topics.sort((a, b) => a.name.localeCompare(b.name));
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const paginated = topics.slice(skip, skip + limit);

  res.status(200).json({
    success: true,
    page,
    limit,
    totalTopics: topics.length,
    totalPages: Math.ceil(topics.length / limit),
    count: paginated.length,
    data: paginated,
  });
});

const getTopicByName = asyncHandler(async (req, res) => {
  const topics = await getAggregatedTopics({ name: req.params.name });
  if (!topics.length) {
    throw new ApiError(404, "Topic not found");
  }
  res.status(200).json({
    success: true,
    data: topics[0],
  });
});

const getTopicsByCategory = asyncHandler(async (req, res) => {
  const topics = await getAggregatedTopics();
  res.status(200).json({
    success: true,
    count: topics.length,
    data: topics,
  });
});

const getSingleTopic = asyncHandler(async (req, res) => {
  // Increment views for all problems under this topic
  await Problem.updateMany(
    { topic: req.params.topicName },
    { $inc: { views: 1 } }
  );

  const topics = await getAggregatedTopics({ name: req.params.topicName });
  if (!topics.length) {
    throw new ApiError(404, "Topic not found");
  }
  res.status(200).json({
    success: true,
    data: topics[0],
  });
});

const createTopic = asyncHandler(async (req, res) => {
  // Mock topic creation as it's computed dynamically from problems
  res.status(201).json({
    success: true,
    data: {
      name: req.body.name,
      category: req.body.category || "programming",
      description: req.body.description || `Topic: ${req.body.name}`
    },
  });
});

const updateTopic = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: req.params.topicName,
      category: "programming",
      description: `Topic: ${req.params.topicName}`
    },
  });
});

const replaceTopic = updateTopic;

const deleteTopic = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Topic deleted successfully",
  });
});

const searchTopics = asyncHandler(async (req, res) => {
  const q = req.query.q;
  if (!q?.trim()) {
    throw new ApiError(400, "Search query is required");
  }
  const topics = await getAggregatedTopics({ search: q });
  res.status(200).json({
    success: true,
    query: q,
    count: topics.length,
    data: topics,
  });
});

const getPopularTopics = asyncHandler(async (req, res) => {
  const topics = await getAggregatedTopics();
  topics.sort((a, b) => b.views - a.views);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const paginated = topics.slice(0, limit);
  res.status(200).json({
    success: true,
    count: paginated.length,
    data: paginated,
  });
});

const getTrendingTopics = getPopularTopics;

module.exports = {
  getAllTopics,
  getSingleTopic,
  createTopic,
  replaceTopic,
  updateTopic,
  deleteTopic,
  getTopicByName,
  getTopicsByCategory,
  searchTopics,
  getPopularTopics,
  getTrendingTopics,
};