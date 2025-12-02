
const { removeMarkdown } = require('./log_bug');
const sendMessage = require("../../../dispatch/slack/send_message");
const { getUserById } = require("../../../fetch/slack/get_user");
const getPeople = require("../../../utils/basecamp/get_people");
const { BASECAMP } = require('../../../constants');
const { createCard } = require('../../../dispatch/basecamp/create_card');

// Creates a motion task to log a bug report from Slack
const logEngineSuggestion = async (data, basecampToken) => {
  const { user, message, channel } = data;
  const { text } = message;
  const { id: channelId, name: channelName } = channel;

  // Check if not a reply
  if (message.parent_user_id) {
    console.log('Ignoring reply in thread');
    return 'Sorry, I cannot log an engine suggestion in a thread.';
  }
  if (channelName === 'privategroup') {
    console.log('Ignoring private group');
    return 'Sorry, I cannot log an engine suggestion in a private group.';
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
  const messageUrl = `https://urban-intelligence.slack.com/archives/${channelId}/p${message.ts.replace('.', '')}`;
  return createCard(basecampToken, {
    bucketId: BASECAMP.BUCKET.ENGINE_SUGGESTIONS,
    cardListId: BASECAMP.CARD_LIST.ENGINE_SUGGESTIONS_TRIAGE,
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
      markdown_text: `<@${user.id}> has logged this as a ![engine suggestion.](${cardUrl})`,
    }).then(() => {
      console.log('Engine suggestion response sent successfully.');
    }).catch(error => {
      console.error('Error sending engine suggestion response:', error);
    });
  }).catch(error => {
    console.error('Error logging engine suggestion:', error);
  });
}

module.exports = {
  logEngineSuggestion
}