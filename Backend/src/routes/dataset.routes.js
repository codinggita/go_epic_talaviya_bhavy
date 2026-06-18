const express = require("express");

const router = express.Router();

const Dataset = require("../models/dataset.model");
const { getAllDatasets, getSingleDataset, createDataset, replaceDataset, updateDataset, deleteDataset, searchDatasets, getLatestDatasets, getDatasetsBySource, getDatasetsByTopic, getDatasetsByDifficulty, getRecentDatasets } = require("../controllers/dataset.controller");
const { deleteLimiter } = require("../middleware/rateLimit.middleware");



// GET ALL DATASETS
router.get("/", getAllDatasets);

router.get("/search", searchDatasets);

router.get("/latest", getLatestDatasets);

router.get("/source/:source", getDatasetsBySource);

router.get("/topic/:topic", getDatasetsByTopic);

router.get("/difficulty/:difficulty", getDatasetsByDifficulty);


router.get("/recent", getRecentDatasets);

// GET SINGLE DATASET
router.get("/:datasetId", getSingleDataset);


// CREATE DATASET
router.post("/", createDataset);


// REPLACE DATASET
router.put("/:datasetId", replaceDataset);


// UPDATE DATASET
router.patch("/:datasetId", updateDataset);


// DELETE DATASET
router.delete("/:datasetId", deleteLimiter, deleteDataset);

module.exports = router;