const { WebClient } = require("@slack/web-api");

const client = new WebClient(process.env.BOT_TOKEN);

const getAllUsers = async () => {
  try {
    // Call the users.list method using the WebClient
    const result = await client.users.list();

    return result;
  } catch (error) {
    console.error(error);
  }
};

module.exports = getAllUsers;