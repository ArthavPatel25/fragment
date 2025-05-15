const express = require('express');
const { version, author } = require('../../package.json');

const router = express.Router();

// Auth middleware for protected routes
const { authenticate } = require('../auth');

// Secure all /v1 routes
router.use('/v1', authenticate(), require('./api'));

// Public health check route
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'ok',
    author,
    githubUrl: 'https://github.com/ArthavPatel25/fragments',
    version,
  });
});

module.exports = router;
