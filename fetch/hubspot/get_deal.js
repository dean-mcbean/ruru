const axios = require("axios");
const { URLS } = require("../../constants");

/**
 * Fetch a single HubSpot deal by ID.
 * @param {string} dealId - The ID of the deal to fetch.
 * @returns {Promise<Object>} The deal object.
 */
module.exports = async function getDeal(dealId) {
  const url = `${URLS.hubspotCrmV3}/objects/deals/${dealId}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching deal:", error);
    throw error;
  }
};
