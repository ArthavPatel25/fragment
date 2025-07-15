const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);

    // Only allow text-based fragments (text/plain, text/markdown, application/json, etc.)
    if (!fragment.isText) {
      return res.status(415).json({ error: 'Only text-based fragments are supported' });
    }

    const data = await fragment.getData();
    res.setHeader('Content-Type', fragment.type);
    res.status(200).send(data.toString());
  } catch (err) {
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: 'Fragment not found' });
    }

    console.error(err); // helpful during development
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
