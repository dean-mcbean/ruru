const storage = require('node-persist');
const sendMessage = require('../../slack_usecases/send_message');
const updateMessage = require('../../slack_usecases/update_message');


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
    const prStatuses = await storage.getItem('pr_status');
    const pr_status = prStatuses[data.pull_request.id] ?? {};


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
    let status_emoji = pr_status.status_emoji;
    let action_summary = pr_status.action_summary; // By default, leave it at whatever it was last
    if (data.pull_request.merged_at) {
        // Because even on merging, the data.action is still "closed", so we detect it this way
        action_summary = `Merged by ${sender}`; 
        status_emoji = ':merged:';

    } else if (['closed', 'opened', 'reopened', 'review_requested'].includes(data.action)) {
        // Just use those verbs
        action_summary = `${readable_action} by ${sender}`
        status_emoji = {
            'closed': ':x:', 
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
    pr_status.status_emoji = status_emoji;
    pr_status.action_summary = action_summary;
    

    //Description
    var description = pr_status.description ?? generateDescription(data);
    if (data.pull_request.body) description = data.pull_request.body
    pr_status.description = description; // I save this before closed on purpose, to keep the description in case it reopens
    if (data.action == 'closed') description = ''

    
    pr_status.title = data.pull_request.title;


    let button = undefined;
    if (data.pull_request.state != 'closed' && !(data.review && data.action == 'submitted')) {
        button = {
            "type": "button",
            "text": {
                "type": "plain_text",
                "text": ":eyes: Review Pull Request",
                "emoji": true
            },
            "value": `${data.pull_request.id}`,
            "url": data.pull_request.html_url + '/files',
            "action_id": "pull_request.add_reviewer"
        }
    }

    // All Message Blocks
    let message_blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `<${data.pull_request.html_url}|${status_emoji}  *${data.pull_request.title}*>
${description}`
            },
            "accessory": button
        },
        {
            "type": "context",
            "elements": [
                {
                    "text": `PR by ${creator} |  *${status}*  |  ${action_summary}  |  ${repo_url}`,
                    "type": "mrkdwn"
                }
            ]
        },
        {
            "type": "divider"
        }
    ];
    if (data.pull_request.merged_at) {
        message_blocks = [
            {
                "type": "context",
                "elements": [
                    {
                        "text": `${pr_status.status_emoji}  ${pr_status.title}  |  *${status}*  |  ${repo_url}`,
                        "type": "mrkdwn"
                    }
                ]
            }
        ]
    }

    // Save Presistent PR Status
    pr_status.message_blocks = message_blocks;
    prStatuses[data.pull_request.id] = pr_status;
    await storage.setItem('pr_status', prStatuses)
    return message_blocks;
}


function generateTextForPullRequest (data) {
    console.log(data)
}


const handlePullRequestEvent = async (data) => {
    // fetch persistent storage
    await storage.init({ dir: './storage/pull_requests' });
    const messageInfoByPR = await storage.getItem('messages');
    generateTextForPullRequest(data)

    // React to Pull Request notification type
    if (['opened', 'reopened'].includes(data.action) || !messageInfoByPR[data.pull_request.id]) {
        // Create message
        const result = await sendMessage({
            channel: process.env.DEV_CHAT_CHANNELID, 
            blocks: await generateMessageContentForPullRequest(data)
        })
        messageInfoByPR[data.pull_request.id] = {
            channel: result.channel,
            ts: result.ts
        };
    } else {
        // Edit PR message to reflect any changes
        const messageInfo = messageInfoByPR[data.pull_request.id];
        if (messageInfo) {
            const result = await updateMessage({
                ...messageInfo,
                blocks: await generateMessageContentForPullRequest(data)
            })
        }
    }

    await storage.setItem('messages', messageInfoByPR)
}

module.exports = handlePullRequestEvent