const { Fragment } = require('../../model/fragment');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
const sharp = require('sharp');
const logger = require('../../logger');

// A mapping of file extensions to MIME types
const extToMime = {
  txt: 'text/plain',
  md: 'text/markdown',
  html: 'text/html',
  json: 'application/json',
  png: 'image/png',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

module.exports = async (req, res) => {
  const { id, ext } = req.params;

  try {
    const fragment = await Fragment.byId(req.user, id);

    if (!fragment) {
      return res.status(404).json({ error: 'Fragment not found' });
    }

    const data = await fragment.getData();
    const targetType = extToMime[ext];
    const sourceMimeType = fragment.mimeType;

    // If the target conversion is not supported by the Fragment, return 415
    if (!fragment.formats.includes(targetType)) {
      return res.status(415).json({ error: 'Conversion not supported' });
    }

    // If the source and target are the same, just return the data without conversion
    if (sourceMimeType === targetType) {
      res.setHeader('Content-Type', targetType);
      return res.status(200).send(data);
    }

    let convertedData = data;

    // Handle conversions based on source and target types
    if (sourceMimeType === 'text/markdown' && targetType === 'text/html') {
      convertedData = md.render(data.toString());
    } else if (sourceMimeType.startsWith('image/')) {
      const sharpImage = sharp(data);
      const convertedImage = sharpImage.toFormat(ext);
      convertedData = await convertedImage.toBuffer();
    }

    res.setHeader('Content-Type', targetType);
    return res.status(200).send(convertedData);

  } catch (err) {
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: 'Fragment not found' });
    }

    logger.error('Error in get-id-ext:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};