const axios = require('axios');
const { BASECAMP } = require('../../constants');

// Fetch all Basecamp projects in the account
module.exports = async function getProjects(basecampToken) {
  try {
    const response = await axios.get(
      `https://3.basecampapi.com/${BASECAMP.ACCOUNT_ID}/projects.json`,
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
    console.error('Error fetching projects:', error);
    throw error;
  }
};