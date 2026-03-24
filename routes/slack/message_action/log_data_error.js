const { removeMarkdown } = require('./log_bug');
const { BASECAMP, slackMessagePermalink } = require('../../../constants');
const { createCard } = require('../../../dispatch/basecamp/create_card');
const { getUserById } = require("../../../fetch/slack/get_user");
const getPeople = require("../../../utils/basecamp/get_people");
const sendMessage = require("../../../dispatch/slack/send_message");

// Creates a motion task to log a bug report from Slack
const logDataError = async (data, basecampToken) => {
  const { user, message, channel } = data;
  const { text } = message;
  const { id: channelId, name: channelName } = channel;

  // Check if not a reply
  if (message.parent_user_id) {
    console.log('Ignoring reply in thread');
    return 'Sorry, I cannot log a data error in a thread.';
  }
  if (channelName === 'privategroup') {
    console.log('Ignoring private group');
    return 'Sorry, I cannot log a data error in a private group.';
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
    bucketId: BASECAMP.BUCKET.DATA_ERRORS,
    cardListId: BASECAMP.CARD_LIST.DATA_ERRORS_TRIAGE,
    title: `${bugTitle}`,
    content: `<em>Logged from <a href="${messageUrl}">Slack</a> by ${userEmbed}</em><br><br>${text}`,
  }).then(response => {
    const cardUrl = response.data.app_url;
    console.log('Basecamp card created successfully:', cardUrl);

    // post a comment on the bug report in slack
    sendMessage({
      channel: channelId,
      thread_ts: message.ts,
      icon_emoji: ':ruruspecs:',
      markdown_text: `<@${user.id}> has logged this as a ![data error.](${cardUrl})`,
    }).then(() => {
      console.log('Data error response sent successfully.');
    }).catch(error => {
      console.error('Error sending data error response:', error);
    });
  }).catch(error => {
    console.error('Error logging data error:', error);
  });
}

module.exports = {
  logDataError
}