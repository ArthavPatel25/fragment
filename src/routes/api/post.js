const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const contentType = require('content-type');

module.exports = async (req, res) => {
  console.log('>>> Reached POST /v1/fragments');
  let parsed;

  // Parse content-type header
  try {
    parsed = contentType.parse(req);
  } catch (err) {
    logger.warn({ err }, 'Invalid Content-Type header');
    return res.status(415).json({ error: 'Unsupported or missing Content-Type header' });
  }

  const type = parsed.type;

  // Check if the content type is supported
  if (!Fragment.isSupportedType(type)) {
    logger.warn({ type }, 'Unsupported content type');
    return res.status(415).json({ error: 'Unsupported content type' });
  }

  // Check if the request body is valid
  if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
    logger.error('Request body is not a Buffer');
    return res.status(400).json({ error: 'Invalid or missing request body' });
  }

  try {
    console.log('Incoming fragment post request');
    console.log('User:', req.user);
    console.log('Content-Type:', type);
    console.log('Buffer size:', req.body.length);

    // Create and save fragment
    const fragment = new Fragment({
      ownerId: req.user,
      type,
      size: req.body.length,
    });

    await fragment.setData(req.body);
    logger.info(`saving fragment with ID: ${fragment.id}`)
    await fragment.save();

    console.log('Fragment saved:', fragment);

    // Build the Location URL
    const baseUrl = process.env.API_URL || `${req.protocol}://${req.headers.host}`;
    const location = new URL(`/v1/fragments/${fragment.id}`, baseUrl);

    res.setHeader('Location', location.toString());

    res.status(201).json({
      status: 'ok',
      fragment: {
        id: fragment.id,
        ownerId: fragment.ownerId,
        created: fragment.created,
        updated: fragment.updated,
        type: fragment.type,
        size: fragment.size,
      },
    });
  } catch (err) {
    logger.error({ err }, 'Error saving fragment');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
