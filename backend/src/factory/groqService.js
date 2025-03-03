const { Groq } = require("groq-sdk");

class GroqService {
  constructor() {
    if (!GroqService.instance) {
      if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY environment variable not set');
      }
      
      this.client = new Groq({
        apiKey: process.env.GROQ_API_KEY,
        timeout: 30000 // 30 seconds timeout
      });
      GroqService.instance = this;
    }
    return GroqService.instance;
  }

  async generateResponse(prompt) {
    try {
      const chatCompletion = await this.client.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "mixtral-8x7b-32768", // Updated recommended model
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
      });

      if (!chatCompletion.choices?.[0]?.message?.content) {
        throw new Error('Empty response from Groq API');
      }

      return chatCompletion.choices[0].message.content;
    } catch (error) {
      console.log('Groq API Error - Single Prompt', {
        error: error.message,
        prompt: prompt.substring(0, 50) + '...'
      });
      throw new Error(`Groq API failed: ${error.message}`);
    }
  }

  async generateResponseBatch(prompts) {
    try {
      if (!Array.isArray(prompts) || prompts.length === 0) {
        throw new Error('Invalid prompts array');
      }

      const batchSize = 5; // Adjust based on rate limits
      const batches = [];
      
      // Batch requests to avoid rate limiting
      for (let i = 0; i < prompts.length; i += batchSize) {
        const batch = prompts.slice(i, i + batchSize);
        batches.push(batch);
      }

      const results = [];
      for (const batch of batches) {
        const responses = await Promise.allSettled(
          batch.map(prompt => this.generateResponse(prompt))
        );
        
        results.push(...responses.map(res => 
          res.status === 'fulfilled' ? res.value : 'Error: Request failed'
        ));
        
        // Add delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return results;
    } catch (error) {
      console.log('Groq Batch Processing Error', {
        error: error.message,
        promptCount: prompts.length
      });
      throw new Error(`Batch processing failed: ${error.message}`);
    }
  }
}

module.exports = GroqService;