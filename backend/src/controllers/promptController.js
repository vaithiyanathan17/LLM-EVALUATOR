const pool = require("../models/db");
const { addTemplateFillingJob } = require("../queues/templateQueue");

const savePrompt = async (req, res) => {
  try {
    const { datasetId, template } = req.body;

    if (!datasetId || !template) {
      return res.status(400).json({ error: "Dataset ID and prompt template are required" });
    }

    // Save the template
    const templateResult = await pool.query(
      "INSERT INTO prompts (dataset_id, template, created_at) VALUES ($1, $2, NOW()) RETURNING id",
      [datasetId, template]
    );
    const templateId = templateResult.rows[0].id;

    // Enqueue template-filling job in BullMQ
    await addTemplateFillingJob({ templateId, datasetId, template });

    res.json({ success: true, message: "Prompt saved and enqueued for processing!" });
  } catch (err) {
    console.error("Error saving prompt:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { savePrompt };


const getPromptsByDatasetId = async (req, res) => {
  try {
    const { datasetId } = req.params;

    const result = await pool.query(
      "SELECT * FROM prompts WHERE dataset_id = $1 ORDER BY created_at DESC",
      [datasetId]
    );

    res.json({ success: true, prompts: result.rows });
  } catch (err) {
    console.error("Error fetching prompts:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { savePrompt, getPromptsByDatasetId };