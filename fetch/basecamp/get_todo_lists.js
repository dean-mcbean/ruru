const axios = require('axios');
const { BASECAMP } = require('../../constants');

/**
 * Fetch all todo lists within a Basecamp project.
 * @param {string} basecampToken - The Basecamp access token.
 * @param {number|string} bucketId - The project (bucket) ID.
 * @param {number|string} todosetId - The to-do set ID.
 * @returns {Promise<Array>} - A promise that resolves to an array of todo lists.
 */
async function getTodoLists(basecampToken, bucketId, todosetId) {
  try {
    const response = await axios.get(
      `https://3.basecampapi.com/${BASECAMP.ACCOUNT_ID}/buckets/${bucketId}/todosets/${todosetId}/todolists.json`,
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
    console.error('Error fetching todo lists:', error);
    throw error;
  }
}

module.exports = getTodoLists;