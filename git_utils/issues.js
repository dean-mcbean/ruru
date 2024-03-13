const { BlockMessageBuilder } = require('../slack_utils/message_blocks');
const { getUserByGithubUsername } = require('../storage_utils/get_user');
const { usePersistentItem } = require('../storage_utils/persistent_item');

function sIf(num) {
  // Returns an 's' if num is greater than 1 i.e. warrants a plural
  return num > 1 ? 's' : ''
}

function generateDescription(data) {
  let description = [];
  if (data.issue.additions) 
    description.push(`${data.issue.additions} Addition${sIf(data.issue.additions)}`)
  if (data.issue.deletions)
    description.push(`${data.issue.deletions} Deletion${sIf(data.issue.deletions)}`)
  if (data.issue.changed_files)
    description.push(`${data.issue.changed_files} Changed File${sIf(data.issue.changed_files)}`)
  return description.join(', ')
}

async function generateMessageContentForIssue(data) {
  // Fetch info on this issue's status
  const issue_url = data.issue.html_url.split('.');
  const persistent_issue_status = await usePersistentItem('issues', 'issue_status', issue_url[issue_url.length - 1]);
  const issue_status = await persistent_issue_status.get();


  let creator = data.issue.user.login;
  const slack_user = await getUserByGithubUsername(creator);
  if (slack_user) {
    creator = slack_user.profile.first_name;
  }
  let sender = data.sender.login; // The person who did this data.action
  const slack_sender = await getUserByGithubUsername(sender);
  if (slack_sender) {
    sender = slack_sender.profile.first_name;
  }

  // Determine Status Emoji
  var status = 'Open';
  if (data.issue.state == 'closed') {
    // Closed
    status = 'Closed';
  }

  // Link to repo
  const repo_url = `<${data.repository.html_url}|${data.repository.name}>`;

  // Determine Status and Action summary
  const readable_action = data.action.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
  let status_emoji = issue_status?.status_emoji;
  let action_summary = issue_status?.action_summary; // By default, leave it at whatever it was last
  if (data.issue.state == 'closed') {
    action_summary = `Closed by ${sender}`; 
    status_emoji = ':x:';

  } else if (['opened', 'reopened', 'edited'].includes(data.action)) {
    // Just use those verbs
    action_summary = `${readable_action} by ${sender}`
    status_emoji = {
      'edited': ':pencil:', 
      'opened': ':eight_spoked_asterisk:',
      'reopened': ':eight_spoked_asterisk:'
    }[data.action];

  } else if (data.action == 'created' && data.comment) {
    action_summary = `Commented by ${sender}`;
    status_emoji = ':speech_balloon:';
  } else if (data.issue.assignee) {
    action_summary = `Assigned to ${data.issue.assignee.login}`;
    status_emoji = ':bust_in_silhouette:';
  }
  // Save to persistent memory
  await persistent_issue_status.set('status_emoji', status_emoji);
  await persistent_issue_status.set('action_summary', action_summary);
  

  //Description
  var description = generateDescription(data);
  if (issue_status && issue_status.description) description = issue_status.description;
  if (data.issue.body) description = data.issue.body
  await persistent_issue_status.set('description', description); // I save this before closed on purpose, to keep the description in case it reopens
  if (data.action == 'closed') description = ''

  
  await persistent_issue_status.set('title', data.issue.title);



  // All Message Blocks
  const bmb = new BlockMessageBuilder()
  bmb.addSection({
    text: `<${data.issue.html_url}|${status_emoji}  *${data.issue.title}*>
${description}`,
  })

  if (data.comment) {
    bmb.addSection({
      text: `\`\`\`${data.comment.body}\`\`\``,
    });
  }

  bmb.addContext({
    text: `Issue by ${creator} |  *${status}*  |  ${action_summary}  |  ${repo_url}`
  })
  .addDivider()
  
  if (data.issue.state == 'closed') {
    bmb.clear()
    .addContext({
      text: `*<${data.issue.html_url}|${data.issue.title}>*  |  *${status}*  |  ${repo_url}`
    })
  }

  // Save Presistent Issue Status
  await persistent_issue_status.set('message_blocks', bmb.build());
  return bmb.build();
}

module.exports = { generateMessageContentForIssue }
