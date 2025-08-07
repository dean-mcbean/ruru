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
const { removeMarkdown } = require('./log_bug');

// Creates a motion task to log a feedback from Slack
const logFeedback = async (data) => {
  console.log('Bug Report: ', data)
  const { user, message, channel } = data;
  const { text } = message;
  const { id: channelId, name: channelName } = channel;

  // Check if not a reply
  if (message.parent_user_id) {
    console.log('Ignoring reply in thread');
    return 'Sorry, I cannot log feedback in a thread.';
  }
  if (channelName === 'privategroup') {
    console.log('Ignoring private group');
    return 'Sorry, I cannot log feedback in a private group.';
  }

  // Send the feedback via Get to https://api.usemotion.com/v1/tasks
  const bugTitle = removeMarkdown(text.length > 96 ? `${text.substring(0, 96)}...` : text);
  const messageUrl = `https://urban-intelligence.slack.com/archives/${channelId}/p${message.ts.replace('.', '')}`;
  axios.post('https://api.usemotion.com/v1/tasks', {
    name: `Feedback: ${bugTitle}`,
    projectId: 'pr_6fSvttFTwa59g4uLPtdmvE',
    workspaceId: 'agfySyofHpFf1yCycPaIj',
    description: `[Logged in **#${channelName}** by ${user.name}](${messageUrl})\n\n${text}`,
    dueDate: null,
    status: 'To be prioritised',
    labels: ['Feedback', 'Product'],
    duration: 'NONE',
    assigneeId: 'YBz72wk0FsdfbSUeEyoCEye2chE3',
  }, {
    headers: {
      'X-API-Key': `${process.env.MOTION_KEY}`,
      'Content-Type': 'application/json'
    }
  }).then(response => {
    console.log('Bug report logged successfully:', response.data);
    const taskUrl = `https://app.usemotion.com/web/pm/workspaces/${response.data.workspace.id}?task=${response.data.id}`;

    // post a comment on the bug report in slack
    sendMessage({
      channel: channelId,
      thread_ts: message.ts,
      icon_emoji: ':ruru-test:',
      markdown_text: `<@${user.id}> has logged this as ![feedback.](${taskUrl})`,
    }).then(response => {
      console.log('Feedback response sent successfully:', response.data);
    }).catch(error => {
      console.error('Error sending feedback response:', error);
    });
  }).catch(error => {
    console.error('Error logging feedback:', error);
  });
}

module.exports = {
  logFeedback
}