const { getUsergroupRepos } = require("./get_usergroup_repos");

function getChannelIdForRepo(repo) {
  if (getUsergroupRepos('developers').includes(repo)) {
      return process.env.DEV_CHAT_CHANNELID;
  }
  if (getUsergroupRepos('analysts').includes(repo)) {
      return process.env.ANALYST_CHANNELID;
  }
  return process.env.TESTING_CHANNELID;
}

module.exports = {
  getChannelIdForRepo
}