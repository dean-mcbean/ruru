const axios = require('axios');

// Fetch all projects, handling pagination via nextCursor
module.exports = async function getProjects() {
  const allProjects = [];
  let cursor = null;

  try {
    do {
      const url = `https://api.runn.io/projects` + (cursor ? `?cursor=${encodeURIComponent(cursor)}` : '');
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${process.env.RUNN_TOKEN}`,
          'Content-Type': 'application/json',
          'accept-version': '1.0.0',
        }
      });

      const { values, nextCursor } = response.data;
      if (Array.isArray(values)) {
        allProjects.push(...values);
      }
      cursor = nextCursor;
    } while (cursor);

    return allProjects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}