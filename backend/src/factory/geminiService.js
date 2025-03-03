const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

class GeminiService {
  constructor() {
    if (!GeminiService.instance) {
      this.apiKey = process.env.GEMINI_API_KEY;
      this.client = new GoogleGenerativeAI(this.apiKey);
      this.MAX_RETRIES = 3;
      this.BASE_DELAY = 1000; // 1 second base delay
      GeminiService.instance = this;
    }
    return GeminiService.instance;
  }

  async _executeWithRetry(prompt, retries = this.MAX_RETRIES) {
    try {
      const model = this.client.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      if (retries > 0) {
        const delay = this.BASE_DELAY * Math.pow(2, this.MAX_RETRIES - retries);
        console.log(`Retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this._executeWithRetry(prompt, retries - 1);
      }
      throw error;
    }
  }

  async generateResponse(prompt) {
    try {
      return await this._executeWithRetry(prompt);
    } catch (error) {
      console.error("Gemini API Error:", error.response?.data || error.message);
      return this._handleSpecificErrors(error);
    }
  }

  async generateResponseBatch(prompts) {
    const responses = [];
    
    for (const prompt of prompts) {
      try {
        const response = await this.generateResponse(prompt);
        responses.push(response);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Increased delay
      } catch (error) {
        console.error("Batch Item Failed:", error.message);
        responses.push("Error: Request failed after retries");
      }
    }
    
    return responses;
  }

  _handleSpecificErrors(error) {
    // Handle specific error codes from Gemini API
    const status = error.response?.status;
    const message = error.response?.data?.message || "";
    
    if (status === 429) return "Error: Too many requests - please slow down";
    if (status === 400 && message.includes("safety")) {
      return "Error: Content blocked by safety filters";
    }
    if (status === 503) return "Error: Service temporarily unavailable";
    
    return "Error: Failed to process request";
  }
}

module.exports = GeminiService;