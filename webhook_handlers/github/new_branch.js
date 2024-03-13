
const notifyUserOnNewBranch = require('../../slack_usecases/notifyUser/notifyUserOnNewBranch');
const { getUserByGithubUsername } = require('../../storage_utils/get_user');

const handleNewBranchEvent = async (data) => {
    // Notify user if Branch is updated
    const slack_user = await getUserByGithubUsername(data.sender.login);
    console.log('slack_user', slack_user, data.sender.login);
    if (slack_user) {
        await notifyUserOnNewBranch(slack_user, data);
    }
};

module.exports = {
    handleNewBranchEvent,
};
