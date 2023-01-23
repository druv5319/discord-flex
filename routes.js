const express = require('express');
const router = express.Router();
const client = require('./index')

router.post('/newMessage', async function (req, res) {
    if (req.body.Source === 'SDK') {
        sendDM(req.query.user_id, req.body.Body)
    }
    res.sendStatus(200);
});

async function sendDM(userId, message) {
    const user = await client.users.fetch(userId);
    user.send(message)
}

module.exports = router;