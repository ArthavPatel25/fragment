const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const logger = require('./logger');

// Create the verifier using Cognito settings from environment variables
const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_POOL_ID,
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
  tokenUse: 'id', // We expect id_token, not access_token
});

// Cache public keys (JWKS) for better performance
logger.info('Configured to use AWS Cognito for Authorization');

jwtVerifier
  .hydrate()
  .then(() => logger.info('Cognito JWKS successfully cached'))
  .catch((err) => logger.error({ err }, 'Unable to cache Cognito JWKS'));

// Define the Bearer token strategy
module.exports.strategy = () =>
  new BearerStrategy(async (token, done) => {
    try {
      // Verify the ID token
      const user = await jwtVerifier.verify(token);

      // Log the verified user data
      logger.debug({ user }, 'Verified user token');

      // Return user details to req.user
      done(null, {
        username: user['cognito:username'],
        email: user.email,
        idToken: token, // Send full token if needed for logging
      });
    } catch (err) {
      logger.error({ err, token }, 'Could not verify token');
      done(null, false);
    }
  });

// Middleware to authenticate using the Bearer strategy
module.exports.authenticate = () =>
  passport.authenticate('bearer', { session: false });

