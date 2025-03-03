const { Worker } = require("bullmq");
const redis = require("../config/redis");
const pool = require("../models/db");
const { addPromptToQueue } = require("../queues/promptQueue");

const processTemplateFilling = async (job) => {
  const { templateId, datasetId, template } = JSON.parse(job.data);
  try {
    const datasetResult = await pool.query("SELECT row_data FROM dataset_rows WHERE dataset_id = $1", [datasetId]);
    if (datasetResult.rows.length === 0) {
      throw new Error("Dataset not found");
    }
    console.log(datasetResult.rows);

    const datasetRows = datasetResult.rows.map(row => row.row_data);
    const filledPrompts = [];

    for (const row of datasetRows) {
      let filledPrompt = template;
      Object.keys(row).forEach((key) => {
        filledPrompt = filledPrompt.replace(`{{${key}}}`, row[key]);
      });
      filledPrompts.push([templateId, datasetId, filledPrompt, "pending"]);
    }
    const batchSize = 10000;
    for (let i = 0; i < filledPrompts.length; i += batchSize) {
      const batch = filledPrompts.slice(i, i + batchSize);

      const values = batch.map((_, index) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`).join(", ");
      const query = `
        INSERT INTO generated_prompts (template_id, dataset_id, filled_prompt, status)
        VALUES ${values} RETURNING id, filled_prompt;
      `;

      const flatBatch = batch.flat();
      const insertResult = await pool.query(query, flatBatch);
      console.log("Inserted Prompts:", insertResult.rows);

      for (const row of insertResult.rows) {
        console.log(`Adding prompt to queue: ID=${row.id}, Prompt=${row.filled_prompt}`)
        await addPromptToQueue({ generatedPromptId: row.id, filledPrompt: row.filled_prompt });
      }
    }

    console.log(`Template filled and enqueued for ${filledPrompts.length} rows`);
  } catch (error) {
    console.error("Error processing template:", error);
  }
};

// ✅ Worker should be initialized at the end, without an extra `await`
new Worker("templateQueue", processTemplateFilling, { connection: redis, concurrency: 3 });
