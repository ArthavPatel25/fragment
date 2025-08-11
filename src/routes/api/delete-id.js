// const { Fragment } = require('../../model/fragment');
// const logger = require('../../logger');

// module.exports = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const ownerId = req.user;

//     logger.debug(`Attempting to delete fragment ${id} for user ${ownerId}`);


//     await Fragment.delete(ownerId, id);

//     logger.debug(`Successfully deleted fragment ${id} for user ${ownerId}`);

//     return res.status(200).json({ status: 'ok' });
//   } catch (err) {
//     if (err.message.includes('not found')) {
//       logger.debug(`Fragment ${req.params.id} not found for user ${req.user}`);
//       return res.status(404).json({ error: 'Fragment not found' });
//     }

//     logger.error({ err, fragmentId: req.params.id, ownerId: req.user }, 'Error deleting fragment');
//     return res.status(500).json({ status: 'error', error: { code: 500, message: 'Internal Server Error' } });
//   }
// };
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const { id } = req.params;

  try {
    const fragment = await Fragment.byId(req.user, id);

    if (!fragment) {
      logger.warn({ user: req.user, id }, 'Fragment not found for delete');
      return res.status(404).json({ error: 'Fragment not found' });
    }

    await Fragment.delete(req.user, id);
    logger.info({ user: req.user, id }, 'Fragment deleted successfully');

    res.status(200).json({ status: 'ok', message: 'Fragment deleted successfully' });
  } catch (err) {
    logger.error({ err, user: req.user, id }, 'Error deleting fragment');
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};
