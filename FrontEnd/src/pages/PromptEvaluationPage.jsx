import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./PromptEvaluator.css";
import EvaluationDashboard from "../components/FrontEndEvaluationDashboard";
import EvaluationProgress from "../components/EvaluationProgress";

const PromptEvaluator = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [previousPrompts, setPreviousPrompts] = useState([]);
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const [expandedPromptId, setExpandedPromptId] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [showEvaluationProgress, setShowEvaluationProgress] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/datasets")
      .then((response) => {
        if (response.data.success) {
          setDatasets(response.data.datasets);
        }
      })
      .catch((error) => {
        console.error("Error fetching datasets:", error);
        toast.error("Failed to fetch datasets");
      });
  }, []);

  const columns = useMemo(() => {
    if (!selectedDatasetId) return [];
    const dataset = datasets.find((d) => d.id === selectedDatasetId);
    return dataset ? dataset.columns : [];
  }, [selectedDatasetId, datasets]);

  const insertPlaceholder = (column) => {
    setPrompt((prev) => `${prev} {{${column}}}`);
  };

  const savePrompt = async () => {
    if (!prompt.trim()) {
      toast.error("Prompt cannot be empty!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/prompts/save",
        {
          datasetId: selectedDatasetId,
          template: prompt,
        }
      );

      if (response.status === 200) {
        toast.success("Prompt saved successfully!");
        setShowEvaluationProgress(true);
      } else {
        throw new Error("Failed to save prompt");
      }
    } catch (error) {
      toast.error("Error saving prompt");
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedDatasetId) {
      fetchPreviousPrompts(selectedDatasetId);
    }
  }, [selectedDatasetId]);

  useEffect(() => {
    if (selectedPromptId) {
      fetchEvaluations(selectedPromptId);
    }
  }, [selectedPromptId]);
  
  const fetchPreviousPrompts = async (datasetId) => {
    try {
      console.log(`Fetching prompts for dataset: ${datasetId}`);
      const response = await axios.get(
        `http://localhost:3000/api/evaluation/${datasetId}`
      );
  
      if (response.data.success && Array.isArray(response.data.evaluations)) {
        const formattedPrompts = response.data.evaluations.map((item) => ({
          id: item.generated_prompt_id,
          template: item.template,
          filled_prompt: item.filled_prompt,
          response: item.response,
          correctness: item.correctness,
          faithfulness: item.faithfulness,
        }));
  
        console.log("Fetched prompts:", formattedPrompts);
        setPreviousPrompts(formattedPrompts);
      } else {
        console.log("No prompts found.");
        setPreviousPrompts([]);
      }
    } catch (error) {
      console.error("Error fetching previous prompts:", error);
      setPreviousPrompts([]);
    }
  };
  

  const fetchEvaluations = async (promptId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/evaluation/prompt/${promptId}`
      );

      if (response.data.success) {
        toast.success("Loaded evaluation results");
      }
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      toast.error("Failed to load evaluations");
    }
  };
  const handleDatasetSelect = async (datasetId) => {
    setSelectedDatasetId(datasetId);
    setSelectedPromptId(null);
    setExpandedPromptId(null);
    setPreviousPrompts([]);
    toast.success("Dataset selected");
  
    await fetchPreviousPrompts(datasetId);
  };

  const toggleAccordion = (promptId) => {
    setExpandedPromptId(expandedPromptId === promptId ? null : promptId);
  };

  return (
    <div className="prompt-evaluator">
      <h1>Evaluate Dataset with LLMs</h1>

      <div className="dataset-list">
        <h2>Select a Dataset:</h2>
        {datasets.map((dataset) => (
          <div
            key={dataset.id}
            className={`dataset-item ${
              selectedDatasetId === dataset.id ? "selected" : ""
            }`}
            onClick={() => handleDatasetSelect(dataset.id)}
          >
            {dataset.filename}
          </div>
        ))}
      </div>

      {selectedDatasetId && previousPrompts.length > 0 && (
        <div className="previous-prompts">
          <h2>Previous Prompts</h2>
          {previousPrompts.map((prev) => (
            <div key={prev.id} className="accordion-item">
              <div
                className={`accordion-header ${
                  expandedPromptId === prev.id ? "active" : ""
                }`}
                onClick={() => toggleAccordion(prev.id)}
              >
                {prev.template}
              </div>
              {expandedPromptId === prev.id && (
                <div className="accordion-content">
                  <table className="prompt-table">
                    <thead>
                      <tr>
                        <th>Filled Prompt</th>
                        <th>Response</th>
                        <th>Correctness</th>
                        <th>Faithfulness</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        className={selectedPromptId === prev.id ? "selected" : ""}
                        onClick={() => setSelectedPromptId(prev.id)}
                      >
                        <td>{prev.filled_prompt}</td>
                        <td>{prev.response || "No response available"}</td>
                        <td>{prev.correctness || "N/A"}</td>
                        <td>{prev.faithfulness || "N/A"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedDatasetId && (
        <div className="prompt-builder">
          <h2>Define Your Prompt</h2>
          <p>Click a column to insert it as a placeholder:</p>
          <div className="column-list">
            {columns.map((col) => (
              <button key={col} onClick={() => insertPlaceholder(col)}>
                {col}
              </button>
            ))}
          </div>

          <div className="chat-box">
            <textarea
              rows="4"
              placeholder="Write your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <button className="save-button" onClick={savePrompt}>
            Save Prompt
          </button>
          {showEvaluationProgress && <EvaluationProgress />}
        </div>
      )}
    </div>
  );
};

export default PromptEvaluator;
