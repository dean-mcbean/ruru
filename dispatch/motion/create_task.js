const axios = require("axios");
const { URLS, MOTION_DEFAULTS } = require("../../constants");

/**
 * Generic function to create a task in the motion system.
 */
async function createTask({ title, projectId, content, labels, assigneeId }) {
  return axios
    .post(
      `${URLS.motionApi}/tasks`,
      {
        name: title,
        projectId: projectId,
        workspaceId: MOTION_DEFAULTS.WORKSPACE_ID,
        description: content,
        dueDate: null,
        status: "To be prioritised",
        labels: labels,
        duration: "NONE",
        assigneeId: assigneeId,
      },
      {
        headers: {
          "X-API-Key": `${process.env.MOTION_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )
    .then((response) => {
      response.taskUrl = `${URLS.motionApp}/web/pm/workspaces/${response.data.workspace.id}?task=${response.data.id}`;
      return response;
    })
    .catch((error) => {
      console.error("Error creating task:", error);
      throw error;
    });
}

module.exports = {
  createTask,
};
