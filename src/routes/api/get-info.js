const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user; // or however you get the user id/hash

    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      return res.status(404).json({ error: 'Fragment not found' });
    }

    // Extract metadata
    const {
      id: fragId,
      ownerId: owner,
      type,
      size,
      created,
      updated,
      mimeType,
      isText,
    } = fragment;

    res.status(200).json({
      status: 'ok',
      fragment: {
        id: fragId,
        ownerId: owner,
        type,
        size,
        created,
        updated,
        mimeType,
        isText,
      },
    });
  } catch (err) {
    res.status(404).json({ error: 'Fragment not found', err });
  }
};
