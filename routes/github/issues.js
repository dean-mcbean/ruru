const {
  generateMessageContentForIssue,
} = require("../../utils/slack/message_blocks/github_messages/issues");
const sendMessage = require("../../dispatch/slack/send_message");
const updateMessage = require("../../dispatch/slack/update_message");
const {
  getChannelIdForRepo,
} = require("../../utils/mongodb/get_channelid_for_repo");
const { getUserByGithubUsername } = require("../../utils/mongodb/get_user");
const { usePersistentItem } = require("../../utils/mongodb/persistent_item");
const {
  BlockMessageBuilder,
} = require("../../utils/slack/message_blocks/message_blocks");

async function notifyUserOnIssueUpdate(slack_user, data) {
  if (!slack_user.notifications || !slack_user.notifications.issues) return;

  let sender = data.sender.login;
  const slack_sender = await getUserByGithubUsername(sender);
  if (slack_sender) {
    sender = slack_sender.profile.display_name;
  }

  let issueUrl = "";
  let repoName = "";
  let issueTitle = "";
  if (!data.comment) data.comment = {};
  if (data.issue && data.comment) {
    issueUrl = data.comment.html_url;
    repoName = ` in ${data.repository.name}`;
    issueTitle = data.issue.title;
  }

  let body = "";
  if (data.comment.body) {
    body = `\n\`\`\`${data.comment.body}\`\`\``;
  }

  console.log("data", data);

  const bmb = new BlockMessageBuilder();
  let text = null;

  const punctuation = data.comment.body ? ":" : "!";

  if (data.action === "opened") {
    // Notify user of issue creation
    text = `New Issue!`;
    bmb.addSection({
      text: `:new:  *<${issueUrl}|Your issue>${repoName} has been created by ${sender}${punctuation}*${body}`,
    });
  } else if (data.action === "closed") {
    // Notify user of issue closure
    text = `Issue Closed!`;
    bmb.addSection({
      text: `:x:  *<${issueUrl}|Your issue>${repoName} has been closed by ${sender}${punctuation}*${body}`,
    });
  } else if (data.action === "edited") {
    // Notify user of issue edit
    text = `Issue Edited!`;
    bmb.addSection({
      text: `:pencil2:  *<${issueUrl}|Your issue>${repoName} has been edited by ${sender}${punctuation}*${body}`,
    });
  } else if (data.action === "commented") {
    // Notify user of new comment on issue
    text = `New Comment on Issue!`;
    bmb.addSection({
      text: `:speech_balloon:  *<${issueUrl}|Your issue>${repoName} has a new comment from ${sender}${punctuation}*${body}`,
    });
  }

  if (text !== null) {
    bmb.addContext({
      text: `_on *${issueTitle}*_`,
    });
    bmb.addDivider();
    await sendMessage({
      channel: slack_user.id,
      text,
      blocks: bmb.build(),
    });
  }
}

const handleIssueEvent = async (data) => {
  // fetch persistent storage

  const issue_url = data.issue.html_url.split(".");
  const messageInfo = await usePersistentItem(
    "issues",
    "messages",
    issue_url[issue_url.length - 1],
  );
  const messageInfoValue = await messageInfo.get();
  const messageHasData = await messageInfo.hasData();

  // React to Issue notification type
  console.log(data.action, messageHasData, messageInfoValue);
  if (["opened", "reopened"].includes(data.action)) {
    // Create message
    const result = await sendMessage({
      channel: getChannelIdForRepo(data.repository.name),
      blocks: await generateMessageContentForIssue(data),
      text: `New Issue by ${data.issue.user.login} in ${data.repository.name}`,
    });
    await messageInfo.set({
      channel: result.channel,
      ts: result.ts,
    });
  } else {
    // Edit Issue message to reflect any changes
    if (messageHasData) {
      await updateMessage({
        ...messageInfoValue,
        blocks: await generateMessageContentForIssue(data),
        text: `Updated Issue by ${data.issue.user.login} in ${data.repository.name}`,
      });
    }
  }

  // Notify user if Issue is closed or changes requested
  const slack_user = await getUserByGithubUsername(data.issue.user.login);
  console.log("slack_user", slack_user, data.issue.user.login);
  if (slack_user && data.issue.user.login !== data.sender.login) {
    await notifyUserOnIssueUpdate(slack_user, data);
  }
};

const handleIssueCommentEvent = async (data) => {
  const slack_user = await getUserByGithubUsername(data.comment.user.login);
  if (slack_user && data.comment.user.login !== data.sender.login) {
    await notifyUserOnIssueUpdate(slack_user, data);
  }
};

module.exports = {
  handleIssueEvent,
  handleIssueCommentEvent,
};
