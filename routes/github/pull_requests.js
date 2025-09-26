
const { generateMessageContentForPullRequest } = require('../../utils/slack/message_blocks/github_messages/pull_requests');
const sendMessage = require('../../dispatch/slack/send_message');
const updateMessage = require('../../dispatch/slack/update_message');
const { getChannelIdForRepo } = require('../../utils/mongodb/get_channelid_for_repo');
const { getUserByGithubUsername } = require('../../utils/mongodb/get_user');
const { usePersistentItem } = require('../../utils/mongodb/persistent_item');
const { BlockMessageBuilder } = require("../../utils/slack/message_blocks/message_blocks");

async function notifyUserOnPRUpdate(slack_user, data) {
  if (!slack_user.notifications || !slack_user.notifications.pull_requests) return;

  let sender = data.sender.login;
  const slack_sender = await getUserByGithubUsername(sender);
  if (slack_sender) {
    sender = slack_sender.profile.display_name;
  }

  let prUrl = '';
  let repoName = '';
  let prTitle = '';
  if (!data.review) data.review = {};
  if (data.issue && data.comment) {
    data.review = data.comment;
    data.review.state = "commented";
    prUrl = data.comment.html_url;
    prTitle = data.issue.title;
  } else {
    prUrl = data.pull_request.html_url;
    repoName = ` in ${data.pull_request.head.repo.name}`;
    prTitle = data.pull_request.title;
  }

  let body = '';
  if (data.review.body) {
    body = `\n\`\`\`${data.review.body}\`\`\``;
  }

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


const handlePullRequestEvent = async (data) => {
    // fetch persistent storage
    
    const pr_url = data.pull_request.html_url.split('.');
    const messageInfo = await usePersistentItem('pull_requests', 'messages', pr_url[pr_url.length - 1]);
    const messageInfoValue = await messageInfo.get();
    const messageHasData = await messageInfo.hasData();

    // React to Pull Request notification type
    if (['opened', 'reopened'].includes(data.action)) {
        // Create message
        const result = await sendMessage({
            channel: getChannelIdForRepo(data.pull_request.head.repo.name), 
            blocks: await generateMessageContentForPullRequest(data),
            text: `New PR by ${data.pull_request.user.login} in ${data.pull_request.head.repo.name}`
        })
        if (!result) return;
        await messageInfo.set({
            channel: result.channel,
            ts: result.ts
        });
    } else {
        // Edit PR message to reflect any changes
        if (messageHasData) {
            await updateMessage({
                ...messageInfoValue,
                blocks: await generateMessageContentForPullRequest(data),
                text: `Updated PR by ${data.pull_request.user.login} in ${data.pull_request.head.repo.name}`
            })
        }
    }

    // Notify user if PR is merged, approved, or changes requested
    const slack_user = await getUserByGithubUsername(data.pull_request.user.login);
    if (slack_user && data.pull_request.user.login !== data.sender.login) {
        await notifyUserOnPRUpdate(slack_user, data);
    }
    
    // If PR was merged, add to the dev stage's known PRs
    if (data.pull_request.merged && data.pull_request.base.ref === 'main') {
        const devStage = await usePersistentItem('projects', data.pull_request.head.repo.name, 'stages', 'dev');
        const devStageValue = await devStage.get();
        await devStage.set('prs', [...(devStageValue?.prs ?? []), {
                title: data.pull_request.title,
                url: data.pull_request.html_url,
                user: data.pull_request.user.login,
            }]);
    }
}

const handleIssuePullRequestEvent = async (data) => {
    const slack_user = await getUserByGithubUsername(data.comment.user.login);
    if (slack_user && data.comment.user.login !== data.sender.login) {
        await notifyUserOnPRUpdate(slack_user, data);
    }
}

module.exports = {
    handlePullRequestEvent,
    handleIssuePullRequestEvent
}