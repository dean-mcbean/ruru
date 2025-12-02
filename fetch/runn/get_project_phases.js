const axios = require('axios');

// Fetch all phases for a project, handling pagination via nextCursor
module.exports = async function getProjectPhases() {
  const allPhases = [];
  let cursor = null;

  try {
    do {
      const url = `https://api.runn.io/phases?limit=500` + (cursor ? `&cursor=${encodeURIComponent(cursor)}` : '');
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${process.env.RUNN_TOKEN}`,
          'Content-Type': 'application/json',
          'accept-version': '1.0.0',
        }
      });

      const { values, nextCursor } = response.data;
      if (Array.isArray(values)) {
        allPhases.push(...values);
      }
      cursor = nextCursor;
      console.log(`Fetched ${values.length} phases, nextCursor: ${nextCursor}`);
    } while (cursor);

    return allPhases;
  } catch (error) {
    console.error('Error fetching project phases:', error);
    throw error;
  }
}