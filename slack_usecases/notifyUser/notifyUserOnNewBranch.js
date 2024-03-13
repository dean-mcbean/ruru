const sendMessage = require("../../slack_dispatch/send_message");
const { BlockMessageBuilder } = require("../../slack_utils/message_blocks");
const { getUserByGithubUsername } = require("../../storage_utils/get_user");

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

module.exports = notifyUserOnNewBranch;
