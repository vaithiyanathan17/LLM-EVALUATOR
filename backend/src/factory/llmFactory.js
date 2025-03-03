const GroqService = require("./groqService");
const GeminiService = require("./geminiService");
const OpenAiService = require("./openAiService");

class LLMFactory {
  static instances = {};

  static createLLM(type) {
    if (!LLMFactory.instances[type]) {
      switch (type) {
        case "groq":
          LLMFactory.instances[type] = new GroqService();
          break;
        case "gemini":
          LLMFactory.instances[type] = new GeminiService();
          break;
        case "openAi":
            LLMFactory.instances[type] = new OpenAiService();
            break;
        default:
          throw new Error("Invalid LLM type");
      }
    }
    return LLMFactory.instances[type];
  }
}

module.exports = LLMFactory;