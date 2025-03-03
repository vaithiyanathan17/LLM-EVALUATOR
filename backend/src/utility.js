const pool = require("./models/db");

async function fetchDataForEvaluation(batchSize = 1000) {
  const { rows } = await pool.query(
    `SELECT 
        lr.id AS llm_response_id,
        gp.filled_prompt, 
        dr.row_data, 
        lr.response, 
        lr.llm_provider
     FROM llm_responses lr
     JOIN generated_prompts gp ON lr.generated_prompt_id = gp.id
     JOIN dataset_rows dr ON gp.dataset_id = dr.dataset_id
     WHERE lr.evaluation_status = 'pending'
     LIMIT $1`,
    [batchSize]
  );
  return rows;
}

module.exports = { fetchDataForEvaluation };