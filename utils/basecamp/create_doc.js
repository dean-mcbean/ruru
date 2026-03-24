const axios = require("axios");
const { URLS, BASECAMP } = require("../../constants");

module.exports = async function createBasecampDoc(
  basecampToken,
  bucketId,
  content,
) {
  const response = await axios.post(
    URLS.basecampApiPath(`/buckets/${bucketId}/documents.json`),
    {
      title: "Uploaded Markdown Document",
      content: content,
      status: "active",
    },
    {
      headers: {
        Authorization: `Bearer ${basecampToken}`,
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent": BASECAMP.USER_AGENT,
      },
    },
  );
  return response.data;
};
