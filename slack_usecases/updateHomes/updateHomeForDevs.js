const updateHome = require("../../slack_dispatch/update_home");
const { getDevUsers } = require("../../slack_utils/get_users");
const defaultHomeForDev = require("../../slack_utils/home_sections/devDefault");
const { userSettings } = require("../../slack_utils/home_sections/userSettings");
const { workflowRequestHomeForDev } = require("../../slack_utils/home_sections/workflowRequest");
const { BlockMessageBuilder } = require("../../slack_utils/message_blocks");
const { usePersistentItem } = require("../../storage_utils/persistent_item");



async function buildHomeForDev({user_name, user_id}) {
  // Builds the home for a specific user
  const userConfig = await usePersistentItem('user_config', user_id);
  const userConfigValue = await userConfig.get();
  let bmb = new BlockMessageBuilder()

  if (userConfigValue && userConfigValue.home_view === 'workflow_request') {
    bmb = await workflowRequestHomeForDev({bmb, 
      workflow_request: userConfigValue.workflow_request})

  } else if (userConfigValue && userConfigValue.home_view === 'user_settings') {
    bmb = await userSettings({bmb, userConfigValue})

  } else {
    bmb = await defaultHomeForDev({user_name, bmb})
  }

  bmb.addContext({
    text: `_Last Updated: ${new Date().toLocaleString()}_`
  })

  return bmb.build()
}

async function updateHomeForDevs() {
  const dev_users = await getDevUsers()
  dev_users.forEach(async (user) => {
    await updateHome({
      user_id: user.id,
      blocks: await buildHomeForDev({
        user_name: user.profile.first_name,
        user_id: user.id
      })
    })
  })
}

module.exports = {
  updateHomeForDevs,
  buildHomeForDev
}