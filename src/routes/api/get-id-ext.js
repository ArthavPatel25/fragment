const { Fragment } = require('../../model/fragment');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

module.exports = async (req, res) => {
  const { id, ext } = req.params;

  try {
    const fragment = await Fragment.byId(req.user, id);

    if (!fragment) {
      return res.status(404).json({ error: 'Fragment not found' });
    }

    const data = await fragment.getData();

    // Only support Markdown -> HTML for now
    if (fragment.mimeType === 'text/markdown' && ext === 'html') {
      const html = md.render(data.toString());
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    }

    // fallback to raw if extension is supported and matches format
    const supportedConversions = fragment.formats;
    const extToMime = {
      txt: 'text/plain',
      md: 'text/markdown',
      html: 'text/html',
      json: 'application/json',
    };

    const targetType = extToMime[ext];

    if (!targetType || !supportedConversions.includes(targetType)) {
      return res.status(415).json({ error: 'Conversion not supported' });
    }

    res.setHeader('Content-Type', targetType);
    res.status(200).send(data);
  } catch (err) {
  if (err.message.includes('not found')) {
    return res.status(404).json({ error: 'Fragment not found' });
  }

  console.error('Error in get-id-ext:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
}

};