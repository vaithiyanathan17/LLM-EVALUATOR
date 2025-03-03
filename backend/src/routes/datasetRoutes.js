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
  })

const upload = multer({ storage: storage });

router.post('/upload-dataset', upload.single('file'), uploadDataset);
router.post('/upload-rows', uploadRows);
router.get('/', getDatasets);

module.exports = router;
