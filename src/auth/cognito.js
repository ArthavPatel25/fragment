// src/auth/cognito.js

const BearerStrategy = require('passport-http-bearer');
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const authorize = require('./auth-middleware');
const logger = require('../logger');

// Check environment variables
if (!(process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID)) {
  throw new Error('Missing expected env vars: AWS_COGNITO_POOL_ID, AWS_COGNITO_CLIENT_ID');
}

logger.info('Using AWS Cognito for auth');

// Configure Cognito verifier
const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_POOL_ID,
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
  tokenUse: 'access',
  httpTimeout: 10000,
});

// Cache JWKS on startup
jwtVerifier
  .hydrate()
  .then(() => {
    logger.info('Cognito JWKS cached');
  })
  .catch((err) => {
    logger.error({ err }, 'Unable to cache Cognito JWKS');
  });

module.exports.strategy = () =>
  new BearerStrategy(async (token, done) => {
    try {
      console.log('🔐 Received Bearer token:', token);

      const user = await jwtVerifier.verify(token);
      console.log('✅ Token verified. Claims:', user);

      // Try multiple identity claim fallbacks
      const identity =
        user.email ||
        user['cognito:username'] ||
        user['username'] ||
        user['sub'] ||
        user['profile']?.email ||
        user['profile']?.['cognito:username'];

      if (!identity) {
        console.warn('⚠️ No usable identity found in token claims');
        return done(null, false);
      }

      return done(null, identity);
    } catch (err) {
      console.error('❌ JWT verification failed:', err.message);
      return done(null, false);
    }
  });

module.exports.authenticate = () => authorize('bearer');
