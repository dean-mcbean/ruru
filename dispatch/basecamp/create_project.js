const axios = require('axios');
const { BASECAMP } = require('../../constants');

/**
 * Generic function to create a project in Basecamp.
 */
async function createProject(basecampToken, { name, description }) {
  const basecampPromise = axios.post(
    `https://3.basecampapi.com/${BASECAMP.ACCOUNT_ID}/projects.json`,
    {
      name: `${name}`,
      description: `${description}`,
    },
    {
      headers: {
        'Authorization': `Bearer ${basecampToken}`,
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'Ruru (dean.walker@urbanintelligence.com)'
      }
    }
  );
  return basecampPromise.catch(error => {
    console.error('Error creating project:', error);
    throw error;
  });
}

module.exports = {
  createProject
};