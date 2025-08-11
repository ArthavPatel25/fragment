const express = require('express');
const router = express.Router();
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
// const putFragmentById = require('./put-id');

// const auth = require('../../auth');
const logger = require('../../logger');


// Raw body parser for supported types (Buffer-based)
const rawBody = () =>
  express.raw({
    
    inflate: true,
    limit: '5mb',
    type: (req) => {
      console.log('parsing content-type header:', req.headers['content-type']);
      try {
        const { type } = contentType.parse(req);
        const supported = Fragment.isSupportedType(type);
        
        logger.debug({ type, supported }, 'Checking if content-type is supported');
        return supported;
      } catch (err) {
        logger.warn({ err }, 'Error parsing content-type header');
        return false;
      }
    },
  });

logger.info('API router initialized with raw body parser and fragment routes');

// Future endpoints like /v1/fragments will go here
// Group by HTTP method
router.get('/fragments', require('./get'));
router.post('/fragments', rawBody(), require('./post'));

router.get('/fragments/:id.:ext', require('./get-id-ext')); 
router.get('/fragments/:id/info', require('./get-info'));
router.get('/fragments/:id', require('./get-id'));
router.put('/fragments/:id', rawBody(), require('./put-id'));
router.delete('/fragments/:id', require('./delete-id'));

module.exports = router;

