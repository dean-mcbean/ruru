const axios = require("axios");
const { URLS } = require("../../constants");
/**
 * Fetch all HubSpot deals, handling pagination.
 */
module.exports = async function getDeals() {
  const allDeals = [];
  let url = `${URLS.hubspotCrmV3}/objects/deals`;
  let params = { limit: 100 }; // Adjust as needed

  try {
    while (url) {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        params,
      });

      if (response.data && response.data.results) {
        allDeals.push(...response.data.results);
      }

      // Prepare for next page
      if (
        response.data.paging &&
        response.data.paging.next &&
        response.data.paging.next.link
      ) {
        url = response.data.paging.next.link;
        params = {}; // The next.link already contains all params
      } else {
        url = null;
      }
    }
    return allDeals;
  } catch (error) {
    console.error("Error fetching deals:", error);
    throw error;
  }
};
