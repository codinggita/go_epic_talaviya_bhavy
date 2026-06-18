const Problem = require("../models/problem.model");
const Solution = require("../models/solution.model");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const getAdminProblems = asyncHandler(async (req, res) => {
  const problems = await Problem.find();
  res.status(200).json({
    success: true,
    count: problems.length,
    data: problems,
  });
});

const getAdminTopics = asyncHandler(async (req, res) => {
  const uniqueTopics = await Problem.distinct("topic");
  const topics = uniqueTopics.map(t => ({
    name: t,
    category: "programming",
    description: `Topic: ${t}`
  }));

  res.status(200).json({
    success: true,
    count: topics.length,
    data: topics,
  });
});

const getAdminSolutions = asyncHandler(async (req, res) => {
  const solutions = await Solution.find();
  res.status(200).json({
    success: true,
    count: solutions.length,
    data: solutions,
  });
});

const getAggregatedDatasetsList = async () => {
  const pipeline = [
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
  return results.map(r => ({
    _id: `${r.source}-${r.topic}-${r.difficulty}`.replace(/\s+/g, '-'),
    ...r
  }));
};

const getAdminDatasets = asyncHandler(async (req, res) => {
  const datasets = await getAggregatedDatasetsList();
  res.status(200).json({
    success: true,
    count: datasets.length,
    data: datasets,
  });
});

const getAdminDashboard = asyncHandler(async (req, res) => {
  // Aggregate unique topics count
  const uniqueTopics = await Problem.distinct("topic");
  
  // Aggregate unique datasets count (grouped by dataset_source, topic, difficulty)
  const uniqueDatasetsCountResult = await Problem.aggregate([
    {
      $group: {
        _id: {
          source: "$dataset_source",
          topic: "$topic",
          difficulty: "$difficulty"
        }
      }
    },
    { $count: "count" }
  ]);
  const totalDatasets = uniqueDatasetsCountResult[0]?.count || 0;

  const [
    totalProblems,
    totalSolutions,
    problemsByDifficulty,
    problemViews,
    recentProblems,
    recentSolutions
  ] = await Promise.all([
    Problem.countDocuments(),
    Solution.countDocuments(), // also points to dataset collection
    Problem.aggregate([
      { $group: { _id: "$difficulty", count: { $sum: 1 } } }
    ]),
    Problem.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } }
    ]),
    Problem.find().sort("-createdAt").limit(5).select("instruction difficulty topic createdAt"),
    Solution.find().sort("-createdAt").limit(5).select("instruction difficulty topic dataset_source createdAt")
  ]);

  const totalProblemViews = problemViews[0]?.total || 0;
  const totalSolutionViews = totalProblemViews; // since they map to same documents
  const totalTopicViews = totalProblemViews; 
  const totalViews = totalProblemViews;

  // Format difficulty stats — normalize raw DB values (beginner/intermediate/hard)
  const difficultyStats = { easy: 0, medium: 0, advanced: 0 };
  problemsByDifficulty.forEach((stat) => {
    const raw = (stat._id || '').toLowerCase();
    let bucket = 'medium';
    if (raw === 'easy' || raw === 'beginner') bucket = 'easy';
    else if (raw === 'medium' || raw === 'intermediate') bucket = 'medium';
    else if (raw === 'advanced' || raw === 'hard' || raw === 'difficult') bucket = 'advanced';
    difficultyStats[bucket] += stat.count;
  });

  // Map recent items to fit the frontend fields
  const mappedRecentProblems = recentProblems.map(p => ({
    _id: p._id,
    title: p.instruction, // Map to instruction
    difficulty: p.difficulty,
    topic: p.topic,
    createdAt: p.createdAt
  }));

  const mappedRecentSolutions = recentSolutions.map(s => ({
    _id: s._id,
    title: `Solution: ${s.instruction.substring(0, 40)}...`,
    difficulty: s.difficulty,
    topic: s.topic,
    source: s.dataset_source,
    createdAt: s.createdAt
  }));

  // Fetch recent datasets
  const recentDatasetsList = await Problem.aggregate([
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
    { $sort: { createdAt: -1 } },
    { $limit: 5 },
    {
      $project: {
        _id: 0,
        source: { $ifNull: ["$_id.source", "unknown"] },
        topic: { $ifNull: ["$_id.topic", "unknown"] },
        difficulty: { $ifNull: ["$_id.difficulty", "medium"] },
        totalProblems: 1,
        createdAt: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalProblems,
        totalTopics: uniqueTopics.length,
        totalSolutions,
        totalDatasets,
        totalViews,
        viewsBreakdown: {
          problems: totalProblemViews,
          solutions: totalSolutionViews,
          topics: totalTopicViews
        },
        difficultyBreakdown: difficultyStats
      },
      recentActivity: {
        problems: mappedRecentProblems,
        solutions: mappedRecentSolutions,
        datasets: recentDatasetsList
      }
    }
  });
});

const getAdminUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

const createAdminUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "user"
  });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

const updateAdminUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { name, email, role, password } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, "Email already in use");
    }
    user.email = email;
  }

  if (name) user.name = name;
  if (role) user.role = role;
  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  await user.save();

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

const deleteAdminUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot delete your own admin account");
  }

  await User.findByIdAndDelete(userId);

  res.status(200).json({
    success: true,
    message: "User deleted successfully"
  });
});

module.exports = {
  getAdminProblems,
  getAdminTopics,
  getAdminSolutions,
  getAdminDatasets,
  getAdminDashboard,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
};