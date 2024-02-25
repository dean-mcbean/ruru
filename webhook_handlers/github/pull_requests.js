
const { generateMessageContentForPullRequest } = require('../../git_utils/pull_requests');
const sendMessage = require('../../slack_dispatch/send_message');
const updateMessage = require('../../slack_dispatch/update_message');
const notifyUserOnPRUpdate = require('../../slack_usecases/notifyUserOnPRUpdate');
const { getUserByGithubUsername } = require('../../storage_utils/get_user');
const { usePersistentItem } = require('../../storage_utils/persistent_item');


const handlePullRequestEvent = async (data) => {
    // fetch persistent storage
    
    const pr_url = data.pull_request.html_url.split('.');
    const messageInfo = await usePersistentItem('pull_requests', 'messages', pr_url[pr_url.length - 1]);
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

    // Notify user if PR is merged, approved, or changes requested
    console.log("HERE", data)
    const slack_user = await getUserByGithubUsername(data.pull_request.user.login);
    console.log('slack_user', slack_user, data.pull_request.user.login)
    if (slack_user && data.pull_request.user.login !== data.sender.login) {
        await notifyUserOnPRUpdate(slack_user, data);
    }
}

const handleIssuePullRequestEvent = async (data) => {
    const slack_user = await getUserByGithubUsername(data.comment.user.login);
    if (slack_user && data.comment.user.login !== data.sender.login) {
        await notifyUserOnPRUpdate(slack_user, data);
    }
}

module.exports = {
    handlePullRequestEvent,
    handleIssuePullRequestEvent
}