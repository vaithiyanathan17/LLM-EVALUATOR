console.log("🚀 server.js is being executed...");
const express = require('express');
const cors = require('cors');
require("dotenv").config();
const datasetRoutes = require('./routes/datasetRoutes');
const promptRoutes = require('./routes/promptRoutes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

app.use("/api/datasets/", datasetRoutes);
console.log("Dataset routes loaded");
app.use("/api/prompts/", promptRoutes);
console.log("Prompt routes loaded");

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
