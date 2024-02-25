const { filterCollection } = require("./persistent_item");

async function getUserByGithubUsername(username) {
  const users = await filterCollection("user_config", { github_username: username });

  return users[0];
}

module.exports = {
  getUserByGithubUsername
}