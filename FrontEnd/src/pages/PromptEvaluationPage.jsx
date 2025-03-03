import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./PromptEvaluator.css"; // Import styles

const PromptEvaluator = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/datasets")
      .then((response) => {
        if (response.data.success) {
          setDatasets(response.data.datasets);
        }
      })
      .catch((error) => console.error("Error fetching datasets:", error));
  }, []);

  const columns = useMemo(() => {
    if (!selectedDatasetId) return [];
    const dataset = datasets.find((d) => d.id === selectedDatasetId);
    return dataset ? dataset.columns : [];
  }, [selectedDatasetId, datasets]);

  const handleDatasetSelect = (datasetId) => {
    setSelectedDatasetId(datasetId);
  };

  const insertPlaceholder = (column) => {
    setPrompt((prev) => `${prev} {{${column}}}`);
  };

  const savePrompt = async () => {
    if (!prompt.trim()) {
      toast.error("Prompt cannot be empty!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/prompts/save", {
        datasetId: selectedDatasetId,
        template: prompt,
      });

      if (response.status === 200) {
        toast.success("Prompt saved successfully!");
      } else {
        throw new Error("Failed to save prompt");
      }
    } catch (error) {
      toast.error("Error saving prompt");
      console.error(error);
    }
  };

  return (
    <div className="prompt-evaluator">
      <h1>Evaluate Dataset with LLMs</h1>

      {/* Dataset List */}
      <div className="dataset-list">
        <h2>Select a Dataset:</h2>
        {datasets.map((dataset) => (
          <div
            key={dataset.id}
            className={`dataset-item ${selectedDatasetId === dataset.id ? "selected" : ""}`}
            onClick={() => handleDatasetSelect(dataset.id)}
          >
            {dataset.filename}
          </div>
        ))}
      </div>

      {/* Show Columns When Dataset is Selected */}
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

          {/* Chat-Style Prompt Input */}
          <div className="chat-box">
            <textarea
              rows="4"
              placeholder="Write your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <button className="save-button" onClick={savePrompt}>Save Prompt</button>
        </div>
      )}
    </div>
  );
};

export default PromptEvaluator;
