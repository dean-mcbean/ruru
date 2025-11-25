const axios = require('axios');

const createProject = async (name, budget, managerIds) => {
  try {
    const response = await axios.post(
      `https://api.runn.io/projects/`,
      {
        name,
        clientId: 646009, // Assign to Urban Intelligence, to be reassigned
        budget,
        managerIds
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.RUNN_TOKEN}`,
          'Content-Type': 'application/json',
          'accept-version': '1.0.0',
        }
      }
    );
    return response.data;
  } catch (error) {
    // Only log the important parts
    if (error.response) {
      console.error('Runn API error:', error.response.status);
    } else {
      console.error('Axios error:', error.message);
    }
    throw error;
  }
}

module.exports = {
  createProject,
}