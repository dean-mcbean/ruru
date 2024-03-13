const sendMessage = require("../slack_dispatch/send_message");
const { BlockMessageBuilder } = require("../slack_utils/message_blocks");
const { getUserByGithubUsername } = require("../storage_utils/get_user");

async function notifyUserOnIssueUpdate(slack_user, data) {
  let sender = data.sender.login;
  const slack_sender = await getUserByGithubUsername(sender);
  if (slack_sender) {
    sender = slack_sender.profile.display_name;
  }

  let issueUrl = '';
  let repoName = '';
  let issueTitle = '';
  if (!data.comment) data.comment = {};
  if (data.issue && data.comment) {
    issueUrl = data.comment.html_url;
    repoName = ` in ${data.repository.name}`;
    issueTitle = data.issue.title;
  }

  let body = '';
  if (data.comment.body) {
    body = `\n\`\`\`${data.comment.body}\`\`\``;
  }

  console.log('data', data)

  const bmb = new BlockMessageBuilder();
  let text = null;

  const punctuation = data.comment.body ? ':' : '!';

  if (data.action === "opened") {
    // Notify user of issue creation
    text = `New Issue!`;
    bmb.addSection({
      text: `:new:  *<${issueUrl}|Your issue>${repoName} has been created by ${sender}${punctuation}*${body}`
    })
  } else if (data.action === "closed") {
    // Notify user of issue closure
    text = `Issue Closed!`;
    bmb.addSection({
      text: `:x:  *<${issueUrl}|Your issue>${repoName} has been closed by ${sender}${punctuation}*${body}`
    })
  } else if (data.action === "edited") {
    // Notify user of issue edit
    text = `Issue Edited!`;
    bmb.addSection({
      text: `:pencil2:  *<${issueUrl}|Your issue>${repoName} has been edited by ${sender}${punctuation}*${body}`
    })
  } else if (data.action === "commented") {
    // Notify user of new comment on issue
    text = `New Comment on Issue!`;
    bmb.addSection({
      text: `:speech_balloon:  *<${issueUrl}|Your issue>${repoName} has a new comment from ${sender}${punctuation}*${body}`
    })
  }

  if (text !== null) {
    bmb.addContext({
      text: `_on *${issueTitle}*_`
    })
    bmb.addDivider()
    await sendMessage({
      channel: slack_user.id,
      text,
      blocks: bmb.build()
    });
  }
}

module.exports = notifyUserOnIssueUpdate;
