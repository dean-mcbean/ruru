var axios = require('axios');
var sendDeanMessage = require('../slack_dispatch/dm_dean');

let accessToken = null;
let expiresAt = null;

async function ensureBasecampToken(req, res, next) {
  const now = new Date();

  if (!accessToken || new Date(expiresAt) < now) {
    try {
      const response = await axios.post('https://launchpad.37signals.com/authorization/token', {
        type: 'refresh',
        refresh_token: process.env.BASECAMP_REFRESH_TOKEN,
        client_id: process.env.BASECAMP_CLIENT_ID,
        client_secret: process.env.BASECAMP_CLIENT_SECRET
      });

      accessToken = response.data.access_token;
      expiresAt = response.data.expires_at;

      console.log('🔑 Refreshed Basecamp token');
      await sendDeanMessage(`🔑 Refreshed Basecamp token`);
    } catch (err) {
      console.error('❌ Failed to refresh Basecamp token:', err.message);
      await sendDeanMessage(`❌ Failed to refresh Basecamp token: ${err.message}`);
      return res.status(500).send('Basecamp authentication failed');
    }
  }

  req.basecampToken = accessToken;
  next();
}

module.exports = {
  ensureBasecampToken
};