const { Queue } = require("bullmq");
const redis = require("../config/redis");

const templateQueue = new Queue("templateQueue", { connection: redis });

const addTemplateFillingJob = async (jobData) => {
  const data = typeof jobData === 'object' ? JSON.stringify(jobData) : jobData;
  await templateQueue.add("fillTemplate", data);
};

module.exports = { addTemplateFillingJob };
