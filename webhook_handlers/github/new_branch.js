
const notifyUserOnNewBranch = require('../../slack_usecases/notifyUser/notifyUserOnNewBranch');
const { getDevUsers, getAnalystUsers } = require('../../slack_utils/get_users');
const { getUserByGithubUsername } = require('../../storage_utils/get_user');
const { getUsergroupRepos } = require('../../storage_utils/get_usergroup_repos');

const handleNewBranchEvent = async (data) => {
    // Notify user if Branch is updated
    const slack_user = await getUserByGithubUsername(data.sender.login);
    const dev_repos = await getUsergroupRepos('developers');
    const analyst_repos = await getUsergroupRepos('analysts');
    const dev_users = await getDevUsers();
    const analyst_users = await getAnalystUsers();

    if (dev_repos.includes(data.repository.name)) {
        for (const user of dev_users) {
            console.log(user)
            if (user.id !== slack_user.id) {
                await notifyUserOnNewBranch(user, data);
            }
        }
    } else if (analyst_repos.includes(data.repository.name)) {
        for (const user of analyst_users) {
            if (!slack_user || user.id !== slack_user.id) {
                await notifyUserOnNewBranch(user, data);
            }
        }
    }
};

module.exports = {
    handleNewBranchEvent,
};
