// src/routes/api/post.js

const express = require('express');
const router = express.Router();
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

// Middleware to parse authenticated user and handle text fragments
router.post('/fragments', async (req, res) => {
  const ownerId = req.user;

  // Accept only text/plain for now
  const contentType = req.get('Content-Type');
  if (contentType !== 'text/plain') {
    return res.status(415).json(
      createErrorResponse(415, 'Unsupported content type')
    );
  }

  try {
    // ✅ Convert req.body to Buffer
    const buffer = Buffer.from(req.body, 'utf8');

    // Create and save the fragment
    const fragment = new Fragment({
      ownerId,
      type: contentType,
    });

    await fragment.setData(buffer);
    await fragment.save();

    return res.status(201).json(
      createSuccessResponse({ fragment })
    );
  } catch (err) {
    console.error('❌ Error saving fragment:', err);
    res.status(500).json(
      createErrorResponse(500, err.message)
    );
  }
});

module.exports = router;