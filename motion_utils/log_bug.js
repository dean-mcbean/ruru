/* Example data structure for a bug report from Slack
{
  type: 'message_action',
  token: 'PM5jWPRwlZSQNg6kRBjUccUg',
  action_ts: '1754010460.566852',
  team: { id: 'T03AMBT1XC2', domain: 'urban-intelligence' },
  user: {
    id: 'U03KPNJ3PSM',
    username: 'dean.walker',
    team_id: 'T03AMBT1XC2',
    name: 'dean.walker'
  },
  channel: { id: 'C05B36H4A5U', name: 'privategroup' },
  is_enterprise_install: false,
  enterprise: null,
  callback_id: 'log_bug',
  trigger_id: '9285715642357.3361401065410.d585f4d402c502f4f551836264518441',
  response_url: 'https://hooks.slack.com/app/T03AMBT1XC2/9285715595141/tnH6MF9AbLOVYAmpVbl2HuFg',
  message_ts: '1754008330.476979',
  message: {
    text: "Not sure how these happened as demochch on prod doesn't have that FF set and the calls only happen when you enter the module",
    files: [ [Object] ],
    upload: false,
    user: 'U04648D18LB',
    display_as_bot: false,
    blocks: [ [Object] ],
    type: 'message',
    ts: '1754008330.476979',
    client_msg_id: 'fcd3dd71-0de7-46fe-bd50-ba19a09de00c'
  }
} 
and MOTION_KEY is in .env, process.env.MOTION_KEY
*/
const axios = require('axios');
const sendMessage = require("../slack_dispatch/send_message");
const getUser = require("../slack_dispatch/get_user");
const getPeople = require("../basecamp_utils/get_people");

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

  const userInfo = await getUser(user.id);
  let userEmbed = user.name;
  if (userInfo?.user?.profile?.email) {
    const basecampUsers = await getPeople(basecampToken);
    const matchedUser = basecampUsers.find(bcUser => bcUser.email_address?.toLowerCase() === userInfo.user.profile.email.toLowerCase());
    if (matchedUser) {
      userEmbed = `<bc-attachment sgid="${matchedUser.attachable_sgid}"></bc-attachment>`;
    }
  }

  console.log("USERS", user, userInfo);

  // Send the bug report via Get to https://api.usemotion.com/v1/tasks
  const bugTitle = removeMarkdown(text.length > 96 ? `${text.substring(0, 96)}...` : text);
  const messageUrl = `https://urban-intelligence.slack.com/archives/${channelId}/p${message.ts.replace('.', '')}`;
  
  const basecampPromise = axios.post('https://3.basecampapi.com/6024739/buckets/44041429/card_tables/lists/9088297701/cards.json', {
      title: `Bug: ${bugTitle}`,
      content: `<em>Logged from <a href="${messageUrl}">Slack</a> by ${userEmbed}</em><br><br>${text}`,
    }, {
      headers: {
        'Authorization': `Bearer ${basecampToken}`,
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'Ruru (dean.walker@urbanintelligence.com)'
      }
    })
  
  return basecampPromise.then(response => {
    const todoListUrl = response.data.app_url;
    console.log('Basecamp todo list created successfully:', todoListUrl);

    // post a comment on the bug report in slack
    sendMessage({
      channel: channelId,
      thread_ts: message.ts,
      icon_emoji: ':ruru-test:',
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