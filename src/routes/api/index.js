const express = require('express');
const router = express.Router();

// Add the /fragments route
router.use('/', require('./post'));
router.use('/', require('./get'));

module.exports = router;