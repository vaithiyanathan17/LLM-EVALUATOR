const pool = require("../models/db");
const path = require("path");

const uploadDataset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const columns = req.body.columns ? JSON.parse(req.body.columns) : [];
    const filePath = path.join(__dirname, "../../uploads", req.file.filename);
    const result = await pool.query(
      `INSERT INTO datasets (filename, filepath, columns, uploaded_at) VALUES ($1, $2, $3, NOW()) RETURNING id`,
      [req.file.originalname, filePath, JSON.stringify(columns)]
    );

    res.json({ success: true, datasetId: result.rows[0].id });
  } catch (err) {
    console.error("File upload error:", err);
    res.status(500).json({ error: err.message });
  }
};

const isValidJSON = (data) => {
  try {
    JSON.stringify(data);
    return true;
  } catch (error) {
    return false;
  }
};

const uploadRows = async (req, res) => {
  try {
    const { datasetId, rows } = req.body;

    if (!datasetId || !rows || !Array.isArray(rows)) {
      return res.status(400).json({ error: "Invalid data format. Expected datasetId and an array of rows." });
    }
    if (!isValidJSON(rows)) {
      return res.status(400).json({ error: "Invalid JSON format in rows." });
    }

    // Check if dataset exists
    const datasetCheck = await pool.query('SELECT id FROM datasets WHERE id = $1', [datasetId]);
    if (datasetCheck.rows.length === 0) {
      return res.status(404).json({ error: "Dataset not found." });
    }

    // Bulk insert all rows in a single query
    await pool.query(
      `INSERT INTO dataset_rows (dataset_id, row_data)
       SELECT $1, jsonb_array_elements($2::jsonb)`,
      [datasetId, JSON.stringify(rows)]
    );

    console.log(`Inserted ${rows.length} rows into dataset ${datasetId}`);
    res.json({ success: true, message: "Rows uploaded successfully" });
  } catch (err) {
    console.error("Row upload error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getDatasets = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM datasets`);
    res.json({ success: true, datasets: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { uploadDataset, getDatasets, uploadRows };
