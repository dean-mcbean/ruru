const { WebClient } = require("@slack/web-api");

const client = new WebClient(process.env.BOT_TOKEN);

// Create a cache object to store the results
const cache = {};

const getUsergroups = async () => {
  console.log('getUsergroups')
  try {
    // Check if the result is already cached
    if (cache.usergroups) {
      return cache.usergroups;
    }

    // Call the usergroups.list method using the WebClient
    const result = await client.usergroups.list();

    // Cache the result
    cache.usergroups = result;

    return result;
  } catch (error) {
    console.error(error);
  }
};

module.exports = getUsergroups;
