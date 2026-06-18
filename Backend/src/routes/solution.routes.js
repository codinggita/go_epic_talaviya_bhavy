const express = require("express");
const router = express.Router();
const Solution = require("../models/solution.model");
const { getAllSolutions, getSingleSolution, createSolution, replaceSolution, updateSolution, deleteSolution, getSolutionsByTopic, getSolutionsByDifficulty, getSolutionsBySource, searchSolutions, getRecentSolutions, getRandomSolution, getTrendingSolutions } = require("../controllers/solution.controller");


//GET ALL PROBLEMS
router.get("/", getAllSolutions);

router.get("/search", searchSolutions);

router.get("/recent", getRecentSolutions);

router.get("/topic/:topic", getSolutionsByTopic);

router.get("/difficulty/:difficulty", getSolutionsByDifficulty);

router.get("/source/:source", getSolutionsBySource);

router.get("/random", getRandomSolution);

router.get("/trending", getTrendingSolutions);

router.get("/:solutionId", getSingleSolution);


// CREATE SOLUTION

router.post("/", createSolution)

//REPLACE SOLUTION

router.put("/:solutionId", replaceSolution);

//UPDATE SOLUTION

router.patch("/:solutionId", updateSolution)

//DELETE SOLUTION
router.delete("/:solutionId", deleteSolution);

module.exports = router;