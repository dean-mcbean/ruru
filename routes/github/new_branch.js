
const { getDevUsers, getAnalystUsers } = require('../../fetch/slack/get_users');
const { getUserByGithubUsername } = require('../../utils/mongodb/get_user');
const { getUsergroupRepos } = require('../../utils/mongodb/get_usergroup_repos');
const sendMessage = require("../../dispatch/slack/send_message");
const { BlockMessageBuilder } = require("../../utils/slack/message_blocks/message_blocks");

async function notifyUserOnNewBranch(slack_user, data) {
  if (!slack_user.notifications || !slack_user.notifications.new_branches) return;

  let sender = data.sender.login;
  const slack_sender = await getUserByGithubUsername(sender);
  if (slack_sender) {
    sender = slack_sender.profile.display_name;
  }

  const repoName = ` in ${data.repository.name}`;
  const branchName = data.ref;

  const bmb = new BlockMessageBuilder();
  const text = `New Branch Created!`;
  bmb.addSection({
    text: `:sparkles:  *New branch:  \`${branchName}\`*`
  });
  bmb.addContext({
    text: `_Created by *${sender}*,${repoName}_`
  });
  bmb.addDivider();

  await sendMessage({
    channel: slack_user.id,
    text,
    blocks: bmb.build()
  });
}

const handleNewBranchEvent = async (data) => {
    // Notify user if Branch is updated
    const slack_user = await getUserByGithubUsername(data.sender.login);
    const dev_repos = await getUsergroupRepos('developers');
    const analyst_repos = await getUsergroupRepos('analysts');
    const dev_users = await getDevUsers();
    const analyst_users = await getAnalystUsers();

    if (dev_repos.includes(data.repository.name)) {
        for (const user of dev_users) {
            console.log(user)
            if (user.id !== slack_user.id) {
                await notifyUserOnNewBranch(user, data);
            }
        }
    } else if (analyst_repos.includes(data.repository.name)) {
        for (const user of analyst_users) {
            if (!slack_user || user.id !== slack_user.id) {
                await notifyUserOnNewBranch(user, data);
            }
        }
    }
};

module.exports = {
    handleNewBranchEvent,
};
