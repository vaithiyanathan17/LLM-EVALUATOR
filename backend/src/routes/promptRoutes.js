const express = require("express");
const { savePrompt, getPromptsByDatasetId } = require("../controllers/promptController");

const router = express.Router();

router.post("/save", savePrompt);
router.get("/prompts/:datasetId", getPromptsByDatasetId);

module.exports = router;
