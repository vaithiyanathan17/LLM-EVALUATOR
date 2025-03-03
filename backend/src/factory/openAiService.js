const OpenAI = require("openai");

class OpenAIService {
  constructor() {
    if (!OpenAIService.instance) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY environment variable not set");
      }

      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        timeout: 30000,
        maxRetries: 2,
      });

      OpenAIService.instance = this;
    }
    return OpenAIService.instance;
  }

  /**
   * Generate response for a single prompt
   * @param {string} prompt - The input prompt
   * @param {object} params - Optional parameters
   * @returns {Promise<string>} Generated response
   */
  async generateResponse(prompt, params = {}) {
    try {
      const completion = await this.client.chat.completions.create({
        model: params.model || "gpt-4o-mini",
        store: true,
        messages: [{ role: "user", content: prompt }],
        temperature: params.temperature ?? 0.7,
        max_tokens: params.max_tokens ?? 1024,
        top_p: params.top_p ?? 1,
        stream: false,
      });

      if (!completion.choices?.[0]?.message?.content) {
        throw new Error("Empty response from OpenAI API");
      }

      return completion.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI API Error - Single Prompt", {
        error: error.message,
        prompt: prompt.substring(0, 50) + "...",
        code: error.code,
      });
      throw new Error(`OpenAI API failed: ${this._simplifyError(error)}`);
    }
  }

  /**
   * Process multiple prompts in batches
   * @param {string[]} prompts - Array of input prompts
   * @param {object} params - Optional parameters for all requests
   * @returns {Promise<string[]>} Array of responses
   */
  async generateResponseBatch(prompts, params = {}) {
    try {
      if (!Array.isArray(prompts) || prompts.length === 0) {
        throw new Error("Invalid prompts array");
      }

      const batchSize = params.batchSize || 3; // Adjust based on API rate limits
      const results = [];

      for (let i = 0; i < prompts.length; i += batchSize) {
        const batch = prompts.slice(i, i + batchSize);

        const responses = await Promise.allSettled(
          batch.map((prompt) => this.generateResponse(prompt, params))
        );

        results.push(
          ...responses.map((res) =>
            res.status === "fulfilled" ? res.value : "Error: Request failed"
          )
        );

        // Adaptive delay to prevent hitting rate limits
        if (i + batchSize < prompts.length) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }

      return results;
    } catch (error) {
      console.error("OpenAI Batch Processing Error", {
        error: error.message,
        promptCount: prompts.length,
        code: error.code,
      });
      throw new Error(`Batch processing failed: ${this._simplifyError(error)}`);
    }
  }

  /**
   * Simplify API error messages
   * @private
   */
  _simplifyError(error) {
    if (error.code === "insufficient_quota") return "API quota exceeded";
    if (error.code === "rate_limit_exceeded") return "Rate limit exceeded";
    return error.message;
  }
}

module.exports = OpenAIService;
