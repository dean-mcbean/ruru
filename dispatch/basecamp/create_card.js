const axios = require("axios");
const { BASECAMP } = require("../../constants");

/**
 * Generic function to create a task in the motion system.
 */
async function createCard(
  basecampToken,
  { bucketId, cardListId, title, content },
) {
  const basecampPromise = axios.post(
    `https://3.basecampapi.com/${BASECAMP.ACCOUNT_ID}/buckets/${bucketId}/card_tables/lists/${cardListId}/cards.json`,
    {
      title: `${title}`,
      content: `${content}`,
    },
    {
      headers: {
        Authorization: `Bearer ${basecampToken}`,
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent": BASECAMP.USER_AGENT,
      },
    },
  );
  return basecampPromise.catch((error) => {
    console.error("Error creating task:", error);
    throw error;
  });
}

module.exports = {
  createCard,
};
