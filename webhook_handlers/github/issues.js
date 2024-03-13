const { generateMessageContentForIssue } = require('../../git_utils/issues');
const sendMessage = require('../../slack_dispatch/send_message');
const updateMessage = require('../../slack_dispatch/update_message');
const notifyUserOnIssueUpdate = require('../../slack_usecases/notifyUser/notifyUserOnIssueUpdate');
const { getChannelIdForRepo } = require('../../storage_utils/get_channelid_for_repo');
const { getUserByGithubUsername } = require('../../storage_utils/get_user');
const { usePersistentItem } = require('../../storage_utils/persistent_item');


const handleIssueEvent = async (data) => {
    // fetch persistent storage
    
    const issue_url = data.issue.html_url.split('.');
    const messageInfo = await usePersistentItem('issues', 'messages', issue_url[issue_url.length - 1]);
    const messageInfoValue = await messageInfo.get();
    const messageHasData = await messageInfo.hasData();

    // React to Issue notification type
    console.log(data.action, messageHasData, messageInfoValue)
    if (['opened', 'reopened'].includes(data.action)) {
        // Create message
        const result = await sendMessage({
            channel: getChannelIdForRepo(data.repository.name), 
            blocks: await generateMessageContentForIssue(data),
            text: `New Issue by ${data.issue.user.login} in ${data.repository.name}`
        })
        await messageInfo.set({
            channel: result.channel,
            ts: result.ts
        });
    } else {
        // Edit Issue message to reflect any changes
        if (messageHasData) {
            await updateMessage({
                ...messageInfoValue,
                blocks: await generateMessageContentForIssue(data),
                text: `Updated Issue by ${data.issue.user.login} in ${data.repository.name}`
            })
        }
    }

    // Notify user if Issue is closed or changes requested
    const slack_user = await getUserByGithubUsername(data.issue.user.login);
    console.log('slack_user', slack_user, data.issue.user.login)
    if (slack_user && data.issue.user.login !== data.sender.login) {
        await notifyUserOnIssueUpdate(slack_user, data);
    }
}

const handleIssueCommentEvent = async (data) => {
    const slack_user = await getUserByGithubUsername(data.comment.user.login);
    if (slack_user && data.comment.user.login !== data.sender.login) {
        await notifyUserOnIssueUpdate(slack_user, data);
    }
}

module.exports = {
    handleIssueEvent,
    handleIssueCommentEvent
}