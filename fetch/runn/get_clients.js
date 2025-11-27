const axios = require('axios');

// Fetch all clients, handling pagination via nextCursor
module.exports = async function getClients() {
  const allClients = [];
  let cursor = null;

  try {
    do {
      const url = `https://api.runn.io/clients?limit=200` + (cursor ? `&cursor=${encodeURIComponent(cursor)}` : '');
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${process.env.RUNN_TOKEN}`,
          'Content-Type': 'application/json',
          'accept-version': '1.0.0',
        }
      });

      const { values, nextCursor } = response.data;
      if (Array.isArray(values)) {
        allClients.push(...values);
      }
      cursor = nextCursor;
      console.log(`Fetched ${values.length} clients, nextCursor: ${nextCursor}`);
    } while (cursor);

    return allClients;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
}