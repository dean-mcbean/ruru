const axios = require("axios");
const { URLS, RUNN_DEFAULTS } = require("../../constants");

const createProject = async (name, budget, managerIds, clientId) => {
  try {
    const resolvedClientId =
      clientId !== undefined && clientId !== null
        ? clientId
        : RUNN_DEFAULTS.CLIENT_ID;
    const payload = {
      name,
      budget,
      managerIds,
    };
    if (resolvedClientId !== undefined && resolvedClientId !== null) {
      payload.clientId = resolvedClientId;
    }
    const response = await axios.post(
      `${URLS.runnApi}/projects/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.RUNN_TOKEN}`,
          "Content-Type": "application/json",
          "accept-version": "1.0.0",
        },
      },
    );
    return response.data;
  } catch (error) {
    // Only log the important parts
    if (error.response) {
      console.error("Runn API error:", error.response.status);
    } else {
      console.error("Axios error:", error.message);
    }
    throw error;
  }
};

module.exports = {
  createProject,
};
