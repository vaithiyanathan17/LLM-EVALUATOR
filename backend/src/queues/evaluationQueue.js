const { Queue } = require("bullmq");
const redis = require("../config/redis");
const { fetchDataForEvaluation } = require("../utility");

const evaluationQueue = new Queue("evaluationQueue", { connection: redis });

const enqueueEvaluationJobs = async () => {
  const pendingResponses = await fetchDataForEvaluation(1000);

  for (const row of pendingResponses) {
    await evaluationQueue.add("evaluateResponse", row);
  }
};

enqueueEvaluationJobs().catch(console.error);

module.exports = { evaluationQueue };