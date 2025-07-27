const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user;

    logger.debug(`Attempting to delete fragment ${id} for user ${ownerId}`);

    await Fragment.delete(ownerId, id);

    logger.debug(`Successfully deleted fragment ${id} for user ${ownerId}`);

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    if (err.message.includes('not found')) {
      logger.debug(`Fragment ${req.params.id} not found for user ${req.user}`);
      return res.status(404).json({ error: 'Fragment not found' });
    }

    logger.error(
      { err, fragmentId: req.params.id, ownerId: req.user },
      'Error deleting fragment'
    );
    return res.status(500).json({
      status: 'error',
      error: { code: 500, message: 'Internal Server Error' },
    });
  }
};
