
const { createCollectionListener } = require("../../storage_utils/persistent_item");
const { updateHomeForAnalysts } = require("./updateHomeForAnalysts");
const { updateHomeForDevs } = require("./updateHomeForDevs");

async function updateHomeForAllUsers() {
  await updateHomeForDevs()
  await updateHomeForAnalysts()
}

createCollectionListener('projects', updateHomeForAllUsers)
createCollectionListener('workflows', updateHomeForAllUsers)
createCollectionListener('user_config', updateHomeForAllUsers)
module.exports = updateHomeForAllUsers