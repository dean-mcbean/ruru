const storage = require('node-persist');
const sendMessage = require('../../slack_usecases/send_message');
const updateMessage = require('../../slack_usecases/update_message');


function generateMessageContent(data) {

    // Determine Status Emoji
    var status_emoji = ':eight_spoked_asterisk:';
    if (data.pull_request.merged_at) {
        // It's been merged!
        status_emoji = ':merged:';
    } else if (data.action == 'closed') {
        // Closed and NOT merged
        status_emoji = ':x:'
    }

    const creator = data.pull_request.user.login;
    const sender = data.sender.login; // The person who did this data.action
    const repo_url = `<${data.pull_request.head.repo.html_url}|${data.pull_request.head.repo.name}>`;

    // Context Items - for PR history
    const history_items = [
        {
            "text": (data.action != 'closed' ? `Pull Request  |  Opened by ${creator}  |  ${repo_url}` :
                    `Pull Request  |  Closed by ${sender}  |  ${repo_url}`),
            "type": "mrkdwn"
        }
    ];

    //Description
    var description = `_${data.pull_request.additions} Additions, ${data.pull_request.deletions} Deletions_`
    if (data.pull_request.body) description = data.pull_request.body
    if (data.action == 'closed') description = ''

    // All Message Blocks
    const message_blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `<${data.pull_request.html_url}|${status_emoji}  *${data.pull_request.title}*>
${description}`
            },
            "accessory": (data.action != 'closed' ? {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": ":eyes: Review Pull Request",
                    "emoji": true
                },
                "value": "click_me_123",
                "url": data.pull_request.html_url,
                "action_id": "button-action"
            } : undefined)
        },
        {
            "type": "context",
            "elements": history_items
        },
        {
            "type": "divider"
        }
    ];

    return message_blocks;
}


const handlePullRequestEvent = async (data) => {
    // fetch persistent storage
    await storage.init({ dir: './storage/pull_requests' });
    let messageInfoByPR = await storage.getItem('messages')
    console.log(messageInfoByPR);
    
    console.log(data.action)
    // React to Pull Request notification type
    if (data.action == 'opened') {
        // Create message
        const result = await sendMessage({
            channel: process.env.DEV_CHAT_CHANNELID, 
            blocks: generateMessageContent(data)
        })
        messageInfoByPR[data.pull_request.id] = {
            channel: result.channel,
            ts: result.ts
        };
    } else if (data.action == 'closed' || data.action == 'edited') {
        // Edit PR message to reflect this
        const messageInfo = messageInfoByPR[data.pull_request.id];
        const result = await updateMessage({
            ...messageInfo,
            blocks: generateMessageContent(data)
        })
    }



    await storage.setItem('messages', messageInfoByPR)
}

module.exports = handlePullRequestEvent