const { Worker } = require("bullmq");
const redis = require("../config/redis");
const pool = require("../models/db");
const LLMFactory = require("../factory/llmFactory");

const batchSize = 100;
const batchProcessingInterval = 1000;
let batch = [];

const processBatch = async () => {
  if (batch.length === 0) return;

  const evaluator = LLMFactory.createLLM("openAi");

  const responseIds = batch.map((job) => {
    return job.llm_response_id;
  });
  const responses = batch.map((job) => ({
    filledPrompt: job.filled_prompt,
    rowData: job.row_data,
    response: job.response,
  }));

  batch = [];

  try {
    const evaluationResults = await Promise.allSettled(
      responses.map((r) =>
        evaluator.generateResponse(r.response, r.filledPrompt, r.rowData)
      )
    );

    const queryValues = [];
    const queryParams = [];

    for (let i = 0; i < responseIds.length; i++) {
      const result =
        evaluationResults[i].status === "fulfilled"
          ? evaluationResults[i].value
          : { correctness: null, faithfulness: null };

      queryValues.push(
        `($${queryParams.length + 1}, $${queryParams.length + 2}, $${
          queryParams.length + 3
        })`
      );
      queryParams.push(responseIds[i], result.correctness, result.faithfulness);
    }

    if (queryValues.length > 0) {
        const placeholders = queryValues
          .map(
            (_, index) =>
              `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3}, NOW())`
          )
          .join(", ");
      
        await pool.query(
          `INSERT INTO evaluations (llm_response_id, correctness, faithfulness, created_at) 
           VALUES ${placeholders}`,
          queryParams
        );
      
        await pool.query(
          `UPDATE llm_responses SET evaluation_status = 'completed' WHERE id = ANY($1::int[])`,
          [responseIds]
        );
    }
  } catch (error) {
    console.error(`Error processing evaluation batch:`, error);
  }
};

// Worker to process jobs
new Worker(
  "evaluationQueue",
  async (job) => {
    batch.push(job.data);
    if (batch.length >= batchSize) {
      await processBatch();
    }
  },
  { connection: redis, concurrency: 3 }
);

// Run batch processing at intervals
setInterval(processBatch, batchProcessingInterval);
