const axios = require('axios');

/**
 * Fetch a single HubSpot deal by ID.
 * @param {string} dealId - The ID of the deal to fetch.
 * @returns {Promise<Object>} The deal object.
 */
module.exports = async function getDeal(dealId) {
  const url = `https://api.hubapi.com/crm/v3/objects/deals/${dealId}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching deal:', error);
    throw error;
  }
};
