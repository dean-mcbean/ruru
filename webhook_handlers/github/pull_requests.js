
const { generateMessageContentForPullRequest } = require('../../git_utils/pull_requests');
const sendMessage = require('../../slack_dispatch/send_message');
const updateMessage = require('../../slack_dispatch/update_message');
const { usePersistentItem } = require('../../storage_utils/persistent_item');


const handlePullRequestEvent = async (data) => {
    // fetch persistent storage
    const messageInfo = await usePersistentItem('pull_requests', 'messages', data.pull_request.id);
    const messageInfoValue = await messageInfo.get();
    const messageHasData = await messageInfo.hasData();

    // React to Pull Request notification type
    console.log(data.action, messageHasData, messageInfoValue)
    if (['opened', 'reopened'].includes(data.action) || !messageHasData) {
        // Create message
        const result = await sendMessage({
            channel: process.env.DEV_CHAT_CHANNELID, 
            blocks: await generateMessageContentForPullRequest(data),
            text: `New PR by ${data.pull_request.user.login} in ${data.pull_request.head.repo.name}`
        })
        await messageInfo.set({
            channel: result.channel,
            ts: result.ts
        });
    } else {
        // Edit PR message to reflect any changes
        if (messageHasData) {
            await updateMessage({
                ...messageInfoValue,
                blocks: await generateMessageContentForPullRequest(data),
                text: `Updated PR by ${data.pull_request.user.login} in ${data.pull_request.head.repo.name}`
            })
        }
    }
}

module.exports = handlePullRequestEvent