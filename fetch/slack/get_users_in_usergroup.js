const { WebClient } = require("@slack/web-api");

const client = new WebClient(process.env.BOT_TOKEN);

const getUsersInUsergroup = async (usergroup_id) => {
    try {
        // Call the usergroups.users.list method using the WebClient
        const result = await client.usergroups.users.list({
          usergroup: usergroup_id
        });

        // Get user info for each user ID
        const users = await Promise.all(result.users.map(async (user_id) => {
          const userInfo = await client.users.info({ user: user_id });
          return userInfo.user;
        }));

        return users;
    }
    catch (error) {
        console.error(error);
    }
}

module.exports = {
  getUsersInUsergroup
};