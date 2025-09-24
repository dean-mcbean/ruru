const { WebClient } = require("@slack/web-api");

const client = new WebClient(process.env.BOT_TOKEN);

const getUser = async (userId) => {
  try {
    // Call the users.info method using the WebClient
    const result = await client.users.info({ user: userId });

    return result;
  } catch (error) {
    console.error(error);
  }
};

module.exports = getUser;