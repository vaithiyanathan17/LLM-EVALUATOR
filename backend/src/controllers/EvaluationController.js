const pool = require("../models/db");
const { enqueueEvaluationJobs } = require("../queues/evaluationQueue");

/**
 * Start evaluation process by adding jobs to the queue
 */
const startEvaluation = async (req, res) => {
  try {
    await enqueueEvaluationJobs();
    res.json({ success: true, message: "Evaluation started" });
  } catch (error) {
    console.error("Error starting evaluation:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get evaluation progress
 */
const getEvaluationProgress = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) FILTER (WHERE evaluation_status = 'completed') AS completed,
             COUNT(*) AS total
      FROM llm_responses
    `);

    const { completed, total } = result.rows[0];
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({ success: true, progress });
  } catch (error) {
    console.error("Error fetching evaluation progress:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all evaluations with scores
 */
const getEvaluations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, lr.response, gp.filled_prompt, dr.row_data 
      FROM evaluations e
      JOIN llm_responses lr ON e.llm_response_id = lr.id
      JOIN generated_prompts gp ON lr.generated_prompt_id = gp.id
      JOIN dataset_rows dr ON gp.dataset_id = dr.dataset_id
      ORDER BY e.created_at DESC
    `);
    res.json({ success: true, evaluations: result.rows });
  } catch (err) {
    console.error("Error fetching evaluations:", err);
    res.status(500).json({ error: err.message });
  }
};

const getEvaluationsForDataset = async (req, res) => {
    try {
      const { datasetId } = req.params;
  
      const { rows } = await pool.query(
        `SELECT 
            d.id AS dataset_id,
            d.filename,
            p.id AS prompt_id,
            p.template,
            gp.id AS generated_prompt_id,
            gp.filled_prompt,
            lr.id AS llm_response_id,
            lr.llm_provider,
            lr.response,
            e.correctness,
            e.faithfulness,
            lr.evaluation_status
         FROM datasets d
         JOIN dataset_rows dr ON d.id = dr.dataset_id
         JOIN prompts p ON d.id = p.dataset_id
         JOIN generated_prompts gp ON p.id = gp.template_id
         JOIN llm_responses lr ON gp.id = lr.generated_prompt_id
         LEFT JOIN evaluations e ON lr.id = e.llm_response_id
         WHERE d.id = $1
         ORDER BY gp.created_at DESC`,
        [datasetId]
      );
  
      res.json({ success: true, evaluations: rows });
    } catch (err) {
      console.error("Error fetching evaluations:", err);
      res.status(500).json({ error: err.message });
    }
  };

module.exports = { startEvaluation, getEvaluationProgress, getEvaluations, getEvaluationsForDataset };
