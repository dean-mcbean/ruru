const axios = require('axios');

module.exports = async function createBasecampDoc(basecampToken, bucketId, content) {
  const response = await axios.post(
    `https://3.basecampapi.com/6024739/buckets/${bucketId}/documents.json`,
    {
      title: 'Uploaded Markdown Document',
      content: content,
      status: "active"
    },
    {
      headers: {
        'Authorization': `Bearer ${basecampToken}`,
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'Ruru (dean.walker@urbanintelligence.com)'
      }
    }
  );
  return response.data;
};