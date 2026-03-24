/** Slack `message_action` payload shape: https://api.slack.com/interactivity/handling#payloads */
const sendMessage = require("../../../dispatch/slack/send_message");
const { getUserById } = require("../../../fetch/slack/get_user");
const getPeople = require("../../../utils/basecamp/get_people");
const { BASECAMP, slackMessagePermalink } = require('../../../constants');
const { createCard } = require('../../../dispatch/basecamp/create_card');

const removeMarkdown = (text) => {
  // Remove common markdown characters
  let cleaned = text.replace(/[*_~`|]/g, '');
  // Remove URLs
  cleaned = cleaned.replace(/https?:\/\/[^\s)]+/g, '');
  // Remove chevrons surrounding URLs or text
  cleaned = cleaned.replace(/<([^>]+)>/g, '$1');
  return cleaned;
}

// Creates a motion task to log a bug report from Slack
const logBug = async (data, basecampToken) => {
  console.log('Bug Report: ', data, basecampToken)
  const { user, message, channel } = data;
  const { text } = message;
  const { id: channelId, name: channelName } = channel;

  // Check if not a reply
  if (message.parent_user_id) {
    console.log('Ignoring reply in thread');
    return 'Sorry, I cannot log a bug report in a thread.';
  }
  if (channelName === 'privategroup') {
    console.log('Ignoring private group');
    return 'Sorry, I cannot log a bug report in a private group.';
  }

  const userInfo = await getUserById(user.id);
  let userEmbed = user.name;
  if (userInfo?.user?.profile?.email) {
    const basecampUsers = await getPeople(basecampToken);
    const matchedUser = basecampUsers.find(bcUser => bcUser.email_address?.toLowerCase() === userInfo.user.profile.email.toLowerCase());
    if (matchedUser) {
      userEmbed = `<bc-attachment sgid="${matchedUser.attachable_sgid}"></bc-attachment>`;
    }
  }

  // Send the bug report via Get to https://api.usemotion.com/v1/tasks
  const bugTitle = removeMarkdown(text.length > 96 ? `${text.substring(0, 96)}...` : text);
  const messageUrl = slackMessagePermalink(channelId, message.ts);
  return createCard(basecampToken, {
    bucketId: BASECAMP.BUCKET.BUGS,
    cardListId: BASECAMP.CARD_LIST.BUGS_TRIAGE,
    title: `Bug: ${bugTitle}`,
    content: `<em>Logged from <a href="${messageUrl}">Slack</a> by ${userEmbed}</em><br><br>${text}`,
  }).then(response => {
    const todoListUrl = response.data.app_url;
    console.log('Basecamp todo list created successfully:', todoListUrl);

    // post a comment on the bug report in slack
    sendMessage({
      channel: channelId,
      thread_ts: message.ts,
      icon_emoji: ':ruruspecs:',
      markdown_text: `<@${user.id}> has logged this as a ![bug report.](${todoListUrl})`,
    }).then(() => {
      console.log('Bug report response sent successfully.');
    }).catch(error => {
      console.error('Error sending bug report response:', error);
    });
  }).catch(error => {
    console.error('Error logging bug report:', error);
  });
}

module.exports = {
  logBug,
  removeMarkdown
}