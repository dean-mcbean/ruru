const { WebClient } = require("@slack/web-api");

const client = new WebClient(process.env.BOT_TOKEN);

const getUsersInChannel = async (channel_id) => {
    try {
        // Call the conversations.members method using the WebClient
        const result = await client.conversations.members({
          channel: channel_id
        });

        // Get user info for each user ID
        const users = await Promise.all(result.members.map(async (user_id) => {
          const userInfo = await client.users.info({ user: user_id });
          return userInfo.user;
        }));

        return users;
    }
    catch (error) {
        console.error(error);
    }
}

module.exports = getUsersInChannel;