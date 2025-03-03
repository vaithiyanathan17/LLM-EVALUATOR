
const aiConfig = {
  groqApiKey: process.env.GROQ_API_KEY,
  groqApiUrl: process.env.GROQ_API_URL,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiApiUrl: process.env.GEMINI_API_URL
};

console.log("Loaded AI Config:", process.env);

module.exports = aiConfig;
