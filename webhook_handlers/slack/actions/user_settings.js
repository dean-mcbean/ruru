
const { notificationOptions } = require("../../../storage_utils/get_notifications");
const { usePersistentItem } = require("../../../storage_utils/persistent_item");


const openUserSettings = async (action, data) => {
  const userConfig = await usePersistentItem('user_config', data.user.id);
  await userConfig.set('home_view', 'user_settings');
}

const setGithubUsername = async (action, data) => {
  const userConfig = await usePersistentItem('user_config', data.user.id);
  await userConfig.set('github_username', action.value);
}

const setNotifications = async (action, data) => {
  const userConfig = await usePersistentItem('user_config', data.user.id);
  console.log('notifications', action, data)

  const selectedValues = action.selected_options.map(option => option.value);

  const notificationValues = {}
  notificationOptions.forEach(option => {
    notificationValues[option.value] = selectedValues.includes(option.value);
  })
  await userConfig.set('notifications', notificationValues);
}

module.exports = {
  openUserSettings,
  setGithubUsername,
  setNotifications
};