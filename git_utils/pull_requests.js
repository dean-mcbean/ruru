const { BlockMessageBuilder, createButtonBlock } = require('../slack_utils/message_blocks');
const { usePersistentItem } = require('../storage_utils/persistent_item');

function sIf(num) {
  // Returns an 's' if num is greater than 1 i.e. warrants a plural
  return num > 1 ? 's' : ''
}

function generateDescription(data) {
  let description = [];
  if (data.pull_request.additions) 
      description.push(`${data.pull_request.additions} Addition${sIf(data.pull_request.additions)}`)
  if (data.pull_request.deletions)
      description.push(`${data.pull_request.deletions} Deletion${sIf(data.pull_request.deletions)}`)
  if (data.pull_request.changed_files)
      description.push(`${data.pull_request.changed_files} Changed File${sIf(data.pull_request.changed_files)}`)
  return description.join(', ')
}

async function generateMessageContentForPullRequest(data) {
  // Fetch info on this PR's status
  const persistent_pr_status = await usePersistentItem('pull_requests', 'pr_status', data.pull_request.id);


  const creator = data.pull_request.user.login;
  const sender = data.sender.login; // The person who did this data.action

  // Determine Status Emoji
  var status = 'Open';
  if (data.pull_request.merged_at) {
      // It's been merged!
      status = 'Merged';
  } else if (data.pull_request.state == 'closed') {
      // Closed and NOT merged
      status = 'Closed';
  }

  // Link to repo
  const repo_url = `<${data.pull_request.head.repo.html_url}|${data.pull_request.head.repo.name}>`;

  // Determine Status and Action summary
  const readable_action = data.action.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
  console.log(persistent_pr_status.value)
  let status_emoji = persistent_pr_status.value.status_emoji;
  let action_summary = persistent_pr_status.value.action_summary; // By default, leave it at whatever it was last
  if (data.pull_request.merged_at) {
      // Because even on merging, the data.action is still "closed", so we detect it this way
      action_summary = `Merged by ${sender}`; 
      status_emoji = ':merged:';

  } else if (['closed', 'opened', 'reopened', 'review_requested', 'edited'].includes(data.action)) {
      // Just use those verbs
      action_summary = `${readable_action} by ${sender}`
      status_emoji = {
          'closed': ':x:', 
          'edited': ':pencil:', 
          'opened': ':eight_spoked_asterisk:',
          'reopened': ':eight_spoked_asterisk:',
          'review_requested': ':raising_hand:'
      }[data.action];

  } else if (data.review && data.review.state == 'approved') {
      action_summary = `Approved by ${sender}`;
      status_emoji = ':white_check_mark:';

  } else if (data.review && data.action == 'submitted') {
      // Reviewed & not approved 
      action_summary = `Denied by ${sender}`;
      status_emoji = ':thumbsdown:';
  }
  // Save to persistent memory
  await persistent_pr_status.set('status_emoji', status_emoji);
  await persistent_pr_status.set('action_summary', action_summary);
  

  //Description
  var description = persistent_pr_status.value.description ?? generateDescription(data);
  if (data.pull_request.body) description = data.pull_request.body
  await persistent_pr_status.set('description', description); // I save this before closed on purpose, to keep the description in case it reopens
  if (data.action == 'closed') description = ''

  
  await persistent_pr_status.set('title', data.pull_request.title);


  let button = undefined;
  if (data.pull_request.state != 'closed' && !(data.review && data.action == 'submitted')) {
      button = createButtonBlock({
          text: ':eyes: Review Pull Request',
          value: `${data.pull_request.id}`,
          url: data.pull_request.html_url + '/files',
          action_id: 'pull_request.add_reviewer'
      })
  }

  // All Message Blocks
  const bmb = new BlockMessageBuilder()
  bmb.addSection({
      text: `<${data.pull_request.html_url}|${status_emoji}  *${data.pull_request.title}*>
${description}`,
      accessory: button
  })
  .addContext({
      text: `PR by ${creator} |  *${status}*  |  ${action_summary}  |  ${repo_url}`
  })
  .addDivider()
  
  if (data.pull_request.merged_at) {
      // It's been merged!
      bmb.clear()
      .addContext({
          text: `PR by ${creator} |  *${status}*  |  ${action_summary}  |  ${repo_url}`
      })
  }

  // Save Presistent PR Status
  await persistent_pr_status.set('message_blocks', bmb.build());
  return bmb.build();
}

module.exports = { generateMessageContentForPullRequest }