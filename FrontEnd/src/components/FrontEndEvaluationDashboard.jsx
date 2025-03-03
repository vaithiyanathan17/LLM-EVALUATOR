const EvaluationDashboard = ({ evaluation }) => {
    if (!evaluation) return <div className="evaluation-dashboard">Select a prompt to view evaluation</div>;
  
    return (
      <div className="evaluation-dashboard">
        <h2>Evaluation Results</h2>
        <div className="evaluation-meta">
          <p>Prompt ID: {evaluation.generated_prompt_id}</p>
          <p>Evaluation Date: {new Date(evaluation.created_at).toLocaleString()}</p>
        </div>
        
        <div className="evaluation-metrics">
          <div className="metric-card">
            <h3>Correctness</h3>
            <p>{evaluation.correctness ?? "N/A"}</p>
          </div>
          <div className="metric-card">
            <h3>Faithfulness</h3>
            <p>{evaluation.faithfulness ?? "N/A"}</p>
          </div>
          <div className="metric-card">
            <h3>Response Time</h3>
            <p>{evaluation.response_time ?? "N/A"}ms</p>
          </div>
        </div>
  
        <div className="response-preview">
          <h3>LLM Response</h3>
          <p>{evaluation.response}</p>
        </div>
      </div>
    );
  };
  
  export default EvaluationDashboard;