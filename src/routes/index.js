const express = require('express');
const { version, author } = require('../../package.json');
const { createSuccessResponse } = require('../response');
const { authenticate } = require('../auth');

const router = express.Router();

// Secure all /v1 routes with authentication middleware
router.use('/v1', authenticate(), require('./api'));

// Public health check route
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(
    createSuccessResponse({
      author,
      githubUrl: 'https://github.com/ArthavPatel25/fragments',
      version,
    })
  );
});

module.exports = router;