const express = require('express');
const { version, author } = require('../../package.json');
const { authenticate } = require('../auth');

const router = express.Router();

// Secure all /v1 routes
router.use('/v1', authenticate(), require('./api'));

// Health check
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'ok',
    author,
    githubUrl: 'https://github.com/ArthavPatel2511/fragments',
    version,
  });
});


module.exports = router;