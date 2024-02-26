const sendMessage = require("../slack_dispatch/send_message");
const { BlockMessageBuilder } = require("../slack_utils/message_blocks");
const { getUserByGithubUsername } = require("../storage_utils/get_user");

async function notifyUserOnPRUpdate(slack_user, data) {
  let sender = data.sender.login;
  const slack_sender = await getUserByGithubUsername(sender);
  if (slack_sender) {
    sender = slack_sender.profile.display_name;
  }

  let prUrl = '';
  let repoName = '';
  let prTitle = '';
  if (!data.review) data.review = {};
  if (data.comment) {
    data.review = data.comment;
    data.review.state = "commented";
    prUrl = data.comment.html_url;
    prTitle = data.issue.title;
  } else {
    prUrl = data.pull_request.html_url;
    repoName = ` in ${data.pull_request.head.repo.name}`;
    prTitle = data.pull_request.title;

    if (data.review) {
      prUrl = data.review.html_url;
    }
  }

  let body = '';
  if (data.review.body) {
    body = `\n\`\`\`${data.review.body}\`\`\``;
  }

  console.log('data', data)

  const bmb = new BlockMessageBuilder();
  let text = null;

  const punctuation = data.review.body ? ':' : '!';

  if (data.pull_request?.merged_at && data.action === "closed") {
    // Notify user of merge
    text = `PR Merged!`;
    bmb.addSection({
      text: `:merged:  *<${prUrl}|Your PR>${repoName} has been merged by ${sender}${punctuation}*${body}`
    })
  } else if (data.review.state == "approved") {
    // Notify user of approval
    text = `PR Approved!`;
    bmb.addSection({
      text: `:white_check_mark:  *<${prUrl}|Your PR>${repoName} has been approved by ${sender}${punctuation}*${body}`
    })
  } else if (data.review.state == "changes_requested") {
    // Notify user of changes requested
    text = `Changes Requested!`;
    bmb.addSection({
      text: `:warning:  *<${prUrl}|Your PR>${repoName} has been requested to be changed by ${sender}${punctuation}*${body}`
    })
  } else if (data.review.state == "commented") {
    // Notify user of comment
    text = `New Comment!`;
    bmb.addSection({
      text: `:speech_balloon:  *<${prUrl}|Your PR>${repoName} has a new comment from ${sender}${punctuation}*${body}`
    })
  } else if (data.action === "closed") {
    // Notify user of closure
    text = `PR Closed!`;
    bmb.addSection({
      text: `:x:  *<${prUrl}|Your PR>${repoName} has been closed by ${sender}${punctuation}*${body}`
    })
  }

  if (text !== null) {
    bmb.addContext({
      text: `_on *${prTitle}*_`
    })
    bmb.addDivider()
    await sendMessage({
      channel: slack_user.id,
      text,
      blocks: bmb.build()
    });
  }
}

module.exports = notifyUserOnPRUpdate;
