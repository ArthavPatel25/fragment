const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    const data = await fragment.getData();

    res.setHeader('Content-Type', fragment.type);

    // Handle text and binary data appropriately
    if (fragment.isText) {
      res.status(200).send(data.toString()); // Convert Buffer to string for text
    } else {
      res.status(200).send(data); // Send raw Buffer for images/binary data
    }
  } catch (err) {
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: 'Fragment not found' });
    }

    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};