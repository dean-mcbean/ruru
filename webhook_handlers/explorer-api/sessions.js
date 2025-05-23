const { usePersistentItem } = require('../../storage_utils/persistent_item');

const handleSessionCall = async (req, res) => {
    res.status(400)
    const utcTimeToNearestHour = new Date().setMinutes(0, 0, 0);
    const sessionCalls = await usePersistentItem('api', 'session-calls', utcTimeToNearestHour.toString());
    const sessionCallsValue = await sessionCalls.get() || [];

    console.log('sessionCallsValue', sessionCallsValue)
    console.log('req.body', req.body)

    // if rew.body.client and req.body.email are not in sessionCallsValue, add them
    if (!sessionCallsValue.some((call) => call.client === req.body.client && call.email === req.body.email && call.stage === req.body.stage)) {
        sessionCallsValue.push(req.body);
    }
    await sessionCalls.set(sessionCallsValue);
    res.status(200);
    res.send();
}

module.exports = {
    handleSessionCall
}