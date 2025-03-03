const { Worker } = require("bullmq");
const redis = require("../config/redis");
const pool = require("../models/db");
const LLMFactory = require("../factory/llmFactory");

const batchSize = 100;
const batchProcessingInterval = 1000;
let batch = [];

const processBatch = async () => {
  if (batch.length === 0) return;

  const groq = LLMFactory.createLLM("groq");
  const gemini = LLMFactory.createLLM("gemini");

  const generatedPromptIds = batch.map((job) => job.data.generatedPromptId);
  const filledPrompts = batch.map((job) => job.data.filledPrompt);

  batch = [];

  try {
    const [groqResponses, geminiResponses] = await Promise.allSettled([
      groq.generateResponseBatch(filledPrompts),
      gemini.generateResponseBatch(filledPrompts),
    ]);

    const queryValues = [];
    const queryParams = [];

    for (let i = 0; i < generatedPromptIds.length; i++) {
      const groqResponse =
        groqResponses.status === "fulfilled" && groqResponses.value[i]
          ? groqResponses.value[i]
          : "Error: Groq API request failed";

      const geminiResponse =
        geminiResponses.status === "fulfilled" && geminiResponses.value[i]
          ? geminiResponses.value[i]
          : "Error: Gemini API request failed";

      queryValues.push(`($${queryParams.length + 1}, 'Groq', $${queryParams.length + 2})`);
      queryParams.push(generatedPromptIds[i], groqResponse);

      queryValues.push(`($${queryParams.length + 1}, 'Gemini', $${queryParams.length + 2})`);
      queryParams.push(generatedPromptIds[i], geminiResponse);
    }

    if (queryValues.length > 0) {
      await pool.query(
        `INSERT INTO llm_responses (generated_prompt_id, llm_provider, response) VALUES ${queryValues.join(", ")}`,
        queryParams
      );
    }

  } catch (error) {
    console.error(`Error processing batch:`, error);
  }
};

new Worker(
  "promptQueue",
  async (job) => {
    batch.push(job);
    if (batch.length >= batchSize) {
      await processBatch();
    }
  },
  { connection: redis, concurrency: 3 }
);

setInterval(processBatch, batchProcessingInterval);