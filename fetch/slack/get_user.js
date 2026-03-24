const { WebClient } = require("@slack/web-api");

const client = new WebClient(process.env.BOT_TOKEN);

const getUserById = async (userId) => {
  try {
    // Call the users.info method using the WebClient
    const result = await client.users.info({ user: userId });

    return result;
  } catch (error) {
    console.error(error);
  }
};

const getUserByEmail = async (email) => {
  try {
    // Call the users.lookupByEmail method using the WebClient
    const result = await client.users.lookupByEmail({ email: email });

    return result.user;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  getUserById,
  getUserByEmail,
};
