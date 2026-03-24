const axios = require("axios");
const { BASECAMP } = require("../../constants");

/**
 * Generic function to create a todo in Basecamp.
 */
async function createTodo(
  basecampToken,
  { bucketId, todolistId, content, startDate, endDate },
) {
  const url = `https://3.basecampapi.com/${BASECAMP.ACCOUNT_ID}/buckets/${bucketId}/todolists/${todolistId}/todos.json`;
  const data = {
    content: `${content}`,
    startDate: `${startDate}`,
    endDate: `${endDate}`,
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${basecampToken}`,
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent": BASECAMP.USER_AGENT,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating todo:", error);
    throw error;
  }
}

module.exports = {
  createTodo,
};
