
const { generateMessageContentForPullRequest } = require('../../git_utils/pull_requests');
const sendMessage = require('../../slack_usecases/send_message');
const updateMessage = require('../../slack_usecases/update_message');
const storage = require('node-persist');


const handlePullRequestEvent = async (data) => {
    // fetch persistent storage
    await storage.init({ dir: './storage/pull_requests' });
    const messageInfoByPR = await storage.getItem('messages');

    // React to Pull Request notification type
    if (['opened', 'reopened'].includes(data.action) || !messageInfoByPR[data.pull_request.id]) {
        // Create message
        const result = await sendMessage({
            channel: process.env.DEV_CHAT_CHANNELID, 
            blocks: await generateMessageContentForPullRequest(data),
            text: `New PR by ${data.pull_request.user.login} in ${data.pull_request.head.repo.name}`
        })
        messageInfoByPR[data.pull_request.id] = {
            channel: result.channel,
            ts: result.ts
        };
    } else {
        // Edit PR message to reflect any changes
        const messageInfo = messageInfoByPR[data.pull_request.id];
        if (messageInfo) {
            await updateMessage({
                ...messageInfo,
                blocks: await generateMessageContentForPullRequest(data),
                text: `Updated PR by ${data.pull_request.user.login} in ${data.pull_request.head.repo.name}`
            })
        }
    }

    await storage.setItem('messages', messageInfoByPR)
}

module.exports = handlePullRequestEvent