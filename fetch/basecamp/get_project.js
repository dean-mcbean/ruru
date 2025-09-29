const axios = require('axios');
const { BASECAMP } = require('../../constants');

// Fetch a single Basecamp project by ID
module.exports = async function getProject(basecampToken, bucketId) {
  try {
    const response = await axios.get(
      `https://3.basecampapi.com/${BASECAMP.ACCOUNT_ID}/projects/${bucketId}.json`,
      {
        headers: {
          'Authorization': `Bearer ${basecampToken}`,
          'Content-Type': 'application/json; charset=utf-8',
          'User-Agent': 'Ruru (dean.walker@urbanintelligence.com)'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};