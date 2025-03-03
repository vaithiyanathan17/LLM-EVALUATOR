const express = require('express');
const { uploadDataset, getDatasets, uploadRows } = require('../controllers/datasetController');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Define upload directory inside backend
const dir = path.join(__dirname, '../../uploads');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        cb(null, dir)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/csv' || 
        file.mimetype === 'application/vnd.ms-excel' ||
        (file.originalname && file.originalname.endsWith('.csv'))) {
        cb(null, true);
    } else {
        cb(new Error('Only CSV files are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
});

const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
};

router.post('/upload-dataset', upload.single('file'), handleUploadErrors, uploadDataset);
router.post('/upload-rows', uploadRows);
router.get('/', getDatasets);

module.exports = router;
