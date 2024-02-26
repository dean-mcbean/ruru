const { filterCollection } = require("./persistent_item");


async function getPRChannelFromRepo(repo) {
  const matchingUserGroups = await filterCollection('usergroups', { repos: { $in: [repo] } });
  if (matchingUserGroups.length > 0) {
    return matchingUserGroups[0].pr_channel;
  }
  return process.env.TESTING_CHANNELID;
}

module.exports = {
  getPRChannelFromRepo,
};