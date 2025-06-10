const express = require('express');
const router = express.Router();
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

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

router.get('/fragments', require('./get')); 

logger.info('Registering POST /v1/fragments route');

router.post('/fragments', rawBody(), require('./post'));

module.exports = router;