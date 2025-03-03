const { Queue, QueueEvents } = require("bullmq");
const redis = require("../config/redis");

// Define promptQueue with retry options
const promptQueue = new Queue("promptQueue", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
  limiter: {
    max: 100,
    duration: 60 * 1000
  }
});

const queueEvents = new QueueEvents("promptQueue", { connection: redis });

queueEvents.on("completed", ({ jobId }) => {
  // console.log(`Job ${jobId} completed successfully`);
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`Job ${jobId} failed: ${failedReason}`);
});

const addPromptToQueue = async (jobData) => {
  await promptQueue.add("processPrompt", jobData);
  // console.log(`Job added to promptQueue: ${JSON.stringify(jobData)}`);
};

module.exports = { addPromptToQueue };
