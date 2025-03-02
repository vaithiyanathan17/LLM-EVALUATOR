const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

const datasetRoutes = require('./routes/datasetRoutes');
app.use('/api', datasetRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
