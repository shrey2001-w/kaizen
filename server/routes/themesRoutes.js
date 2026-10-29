const express = require('express');
const { getThemeSettings } = require('../controllers/themeController');
const router = express.Router();

router.get('/', getThemeSettings);

module.exports = router;
