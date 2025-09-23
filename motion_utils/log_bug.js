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

  // Send the bug report via Get to https://api.usemotion.com/v1/tasks
  const bugTitle = removeMarkdown(text.length > 96 ? `${text.substring(0, 96)}...` : text);
  const messageUrl = `https://urban-intelligence.slack.com/archives/${channelId}/p${message.ts.replace('.', '')}`;

  const motionPromise = axios.post('https://api.usemotion.com/v1/tasks', {
    name: `Bug: ${bugTitle}`,
    projectId: 'pr_9VMpAvGReCVL5FJ5exeb4A',
    workspaceId: 'agfySyofHpFf1yCycPaIj',
    description: `[Reported in **#${channelName}** by ${user.name}](${messageUrl})\n\n${text}`,
    dueDate: null,
    status: 'To be prioritised',
    labels: ['devs', 'Bug'],
    duration: 'NONE',
    assigneeId: 'hUnZVMH2U4OqvXLE5GynUFhkeXi2',
  }, {
    headers: {
      'X-API-Key': `${process.env.MOTION_KEY}`,
      'Content-Type': 'application/json'
    }
  })
  
/*   const basecampPromise = axios.post('https://3.basecampapi.com/6024739/buckets/44023863/card_tables/columns/9083785777/cards.json', {
    title: `Bug: ${bugTitle}`,
    description: `Logged from Slack by ${user.name}\n\n${text}\n\nLink to Slack message: ${messageUrl}`,
  }, {
    headers: {
      'Authorization': `Bearer ${basecampToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Ruru (dean.walker@urbanintelligence.com)'
    }
  }) */
  
  // Wait for both requests to complete
  return Promise.all([motionPromise]).then(response => { //, basecampPromise
    console.log('Bug report logged successfully:', response[0].data);
    const taskUrl = `https://app.usemotion.com/web/pm/workspaces/${response[0].data.workspace.id}?task=${response[0].data.id}`;
    const todoListUrl = response[1].data.app_url;
    console.log('Basecamp todo list created successfully:', todoListUrl);

    // post a comment on the bug report in slack
    sendMessage({
      channel: channelId,
      thread_ts: message.ts,
      icon_emoji: ':ruru-test:',
      markdown_text: `<@${user.id}> has logged this as a ![bug report.](${taskUrl}) ![Basecamp To-do List](${todoListUrl})`,
    }).then(response => {
      console.log('Bug report response sent successfully:', response.data);
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