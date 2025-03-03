import { useEffect, useState } from "react";
import axios from "axios";
import "./EvaluationProgress.css"; // Optional: Add styles for better UI

const EvaluationProgress = ({ onComplete }) => {
  const [progress, setProgress] = useState({ pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/api/evaluation/progress");
        setProgress(data);
        setLoading(false);

        if (data.pending === 0 && data.completed > 0) {
          onComplete && onComplete();
          clearInterval(interval);
        }
      } catch (err) {
        setError("Failed to load progress");
        setLoading(false);
        console.error("Error fetching evaluation progress:", err);
      }
    };

    fetchProgress();
    const interval = setInterval(fetchProgress, 3000); 

    return () => clearInterval(interval);
  }, [onComplete]);

  if (loading) return <p>Loading evaluation progress...</p>;
  if (error) return <p className="error">{error}</p>;

  const total = progress.pending + progress.completed;
  const percentage = total > 0 ? Math.round((progress.completed / total) * 100) : 0;

  return (
    <div className="evaluation-progress">
      <h3>Evaluation Progress</h3>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
      <p>Pending: {progress.pending}</p>
      <p>Completed: {progress.completed}</p>
    </div>
  );
};

export default EvaluationProgress;
