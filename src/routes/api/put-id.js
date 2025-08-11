// src/routes/api/put-id.js
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
    const ownerId = req.user;
    const id = req.params.id;
    const type = req.get('Content-Type'); // Get the new type from the request header

    try {
        const data = req.body; // Raw body is already a Buffer due to middleware

        const updatedFragment = await Fragment.put(ownerId, id, data, type); // Use the put method

        if (!updatedFragment) {
            return res.status(404).json({ error: 'Fragment not found' });
        }

        res.status(200).json({ status: 'ok', fragment: updatedFragment });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error', err });
    }
};
