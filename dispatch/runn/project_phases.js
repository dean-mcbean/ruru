const axios = require("axios");
const { URLS } = require("../../constants");

const PHASE_COLORS = [
  "#84DBA0",
  "#67D0D5",
  "#F191CC",
  "#FDCD4F",
  "#B19DE6",
  "#9CE277",
  "#CD97DA",
  "#FFB077",
  "#9CC5BF",
  "#E8C681",
];

/**
 * Creates a new project phase in Runn.
 * @param {*} projectId - The ID of the project to add the phase to.
 * @param {*} phaseName - The name of the new phase.
 * @param {*} startDate - The start date of the new phase. in ISO8061 format: YYYY-MM-DD
 * @param {*} endDate - The end date of the new phase. in ISO8061 format: YYYY-MM-DD
 * @returns The created phase object.
 */
const createProjectPhase = async (projectId, phaseName, startDate, endDate) => {
  const color = PHASE_COLORS[Math.floor(Math.random() * PHASE_COLORS.length)];
  if (!startDate) startDate = new Date().toISOString().split("T")[0];
  if (!endDate) endDate = new Date().toISOString().split("T")[0];
  try {
    const response = await axios.post(
      `${URLS.runnApi}/projects/${projectId}/phases`,
      {
        name: phaseName,
        startDate: startDate,
        endDate: endDate,
        color,
      },
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
  createProjectPhase,
};
