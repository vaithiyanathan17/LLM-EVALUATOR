const express = require("express");
const { startEvaluation, getEvaluationProgress, getEvaluations, getEvaluationsForDataset } = require("../controllers/EvaluationController");

const router = express.Router();

router.post("/start", startEvaluation);
router.get("/progress", getEvaluationProgress);
router.get("/:datasetId", getEvaluationsForDataset);
router.get("/", getEvaluations);

module.exports = router;
