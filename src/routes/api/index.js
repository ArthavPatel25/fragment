const express = require('express');
const router = express.Router();
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
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
router.get('/fragments', require('./get'));
router.get('/fragments/:id.:ext', require('./get-id-ext')); 
router.get('/fragments/:id', require('./get-id'));
router.get('/fragments/:id/info', require('./get-info'));
// POST /fragments (create new fragment with raw body)
logger.info('Registering POST /v1/fragments route');

router.post('/fragments', rawBody(), require('./post'));

module.exports = router;

