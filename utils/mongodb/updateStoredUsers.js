const { getAllUsers } = require("../utils/slack/get_users");
const { usePersistentItem } = require("../storage_utils/persistent_item");

async function updateStoredUsers() {
  const users = await getAllUsers()

  for (const user of users) {
    const userConfig = await usePersistentItem('user_config', user.id);
    
    await userConfig.set({
      ...user,
      ...await userConfig.get(),
    })
  }
}

module.exports = {
  updateStoredUsers
}
