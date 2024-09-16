const { usePersistentItem } = require("../../../storage_utils/persistent_item");

const openPatchNotes = async (action, data) => {
  const userConfig = await usePersistentItem('user_config', data.user.id);
  await userConfig.set('home_view', 'patch_notes');
}

module.exports = {
  openPatchNotes
};