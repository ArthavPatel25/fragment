const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);

    // Only support text/plain for now
    if (!fragment.isText || fragment.mimeType !== 'text/plain') {
      return res.status(415).json({ error: 'Only text/plain fragments are supported' });
    }

    const data = await fragment.getData();

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(data.toString());
  } catch (err) {
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: 'Fragment not found' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
