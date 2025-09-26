const { notificationOptions } = require("../../storage_utils/get_notifications");
const { getUsergroupRepos } = require("../../storage_utils/get_usergroup_repos");
const { bindAction } = require("../../webhook_handlers/slack/action_handler");
const { backToDefault } = require("../../webhook_handlers/slack/actions/back_to_default");
const { setGithubUsername, setNotifications } = require("../../webhook_handlers/slack/actions/user_settings");
const { getDevUsers, getAnalystUsers } = require("../get_users");


async function userSettings({userConfigValue, bmb}) {
  
  bmb.addButton({
    text: `:arrow_backward: Return`,
    action_id: bindAction(`back_to_default`, backToDefault),
    value: 'default'
  })
  .addHeader({
    text: `:gear: User Settings for ${userConfigValue.profile.real_name}`
  })

  // Github username
  bmb.addTextInput({
    label: 'Github Username',
    action_id: bindAction(`setGithubUsername`, setGithubUsername),
    placeholder: 'Enter your github username here',
    initial_value: userConfigValue.github_username || '',
    triggerOn: ['on_enter_pressed']
  })

  // Notifications
  let initial_options = undefined;
  if (userConfigValue.notifications) {
    initial_options = notificationOptions.filter(option => userConfigValue.notifications[option.value])
  }
  bmb.addCheckboxList({
    label: 'Notify Me When:',
    action_id: bindAction(`setNotifications`, setNotifications),
    options: notificationOptions,
    initial_options
  })

  const devUsers = (await getDevUsers()).map(user => user.id)
  const analystUsers = (await getAnalystUsers()).map(user => user.id)
  const usergroup = devUsers.includes(userConfigValue.id) ? 'Developer' : analystUsers.includes(userConfigValue.id) ? 'Analyst' : 'None'

  let accessableRepos = []
  if (usergroup === 'Developer') {
    accessableRepos = getUsergroupRepos('developers')
  } else if (usergroup === 'Analyst') {
    accessableRepos = getUsergroupRepos('analysts')
  }
  
  bmb.addPadding({padding: 2})
  .addDivider()
  .addHeader({
    text: `:scroll: Other Information`
  })
  .addSection({
    text: `*User ID:* ${userConfigValue.id}
*User Group:* ${usergroup}
*Connected Repos:* \`${accessableRepos.join('`, `')}\``
  })



  bmb.addPadding({padding: 2})
  .addDivider()
  
  return bmb
}

module.exports = {
  userSettings,
}
