const { createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const fragments = await Fragment.byUser(req.user, false); // set true if you want full objects
    res.status(200).json(createSuccessResponse({ fragments }));
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', err });
  }
};
