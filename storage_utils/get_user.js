const { filterCollection } = require("./persistent_item");

async function getUserByGithubUsername(username) {
  const users = await filterCollection("user_config", { github_username: username });

  return users[0];
}

async function getUserBySlackId(id) {
  const users = await filterCollection("user_config", { id: id });

  return users[0];
}

async function getUsersWithNotification(notification) {
  const filter = {};
  filter[`notifications.${notification}`] = true;
  const users = await filterCollection("user_config", filter);

  return users;
}

module.exports = {
  getUserByGithubUsername,
  getUserBySlackId,
  getUsersWithNotification
}