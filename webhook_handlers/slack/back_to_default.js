const { usePersistentItem } = require("../../storage_utils/persistent_item");

const backToDefault = async (action, data) => {
  const userConfig = await usePersistentItem('user_config', data.user.id);
  await userConfig.set('home_view', 'default');
  await userConfig.set('workflow_request', undefined);
}

module.exports = {
  backToDefault
};