const { BlockMessageBuilder, createButtonBlock } = require('../slack_utils/message_blocks');
const { getUserByGithubUsername } = require('../storage_utils/get_user');
const { usePersistentItem } = require('../storage_utils/persistent_item');
const { bindAction } = require('../webhook_handlers/slack/action_handler');
const { addReviewerToPullRequest } = require('../webhook_handlers/slack/actions/pull_requests');

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
    const pr_url = data.pull_request.html_url.split('.');
    const persistent_pr_status = await usePersistentItem('pull_requests', 'pr_status', pr_url[pr_url.length - 1]);
    const pr_status = await persistent_pr_status.get();


    let creator = data.pull_request.user.login;
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
    let status_emoji = pr_status?.status_emoji;
    let action_summary = pr_status?.action_summary; // By default, leave it at whatever it was last
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
        action_summary = `Changes Requested by ${sender}`;
        status_emoji = ':warning:';
    }
    // Save to persistent memory
    await persistent_pr_status.set('status_emoji', status_emoji);
    await persistent_pr_status.set('action_summary', action_summary);
    

    //Description
    var description = generateDescription(data);
    if (pr_status && pr_status.description) description = pr_status.description;
    if (data.pull_request.body) description = data.pull_request.body
    await persistent_pr_status.set('description', description); // I save this before closed on purpose, to keep the description in case it reopens
    if (data.action == 'closed') description = ''

    
    await persistent_pr_status.set('title', data.pull_request.title);


    let button = undefined;
    if (data.pull_request.state != 'closed' && !(data.review && data.action == 'submitted')) {
        
        const pr_url = data.pull_request.html_url.split('.');
        button = createButtonBlock({
            text: ':eyes: Review Pull Request',
            value: `${pr_url[pr_url.length - 1]}`,
            url: data.pull_request.html_url + '/files',
            action_id: bindAction('pull_request.add_reviewer', addReviewerToPullRequest)
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
            text: `*<${data.pull_request.html_url}|${data.pull_request.title}>*  |  *${status}*  |  ${repo_url}`
        })
    }

    // Save Presistent PR Status
    await persistent_pr_status.set('message_blocks', bmb.build());
    return bmb.build();
}

module.exports = { generateMessageContentForPullRequest }