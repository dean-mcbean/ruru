
const { createCollectionListener } = require("../../storage_utils/persistent_item");
const { updateHomeForAnalysts } = require("./updateHomeForAnalysts");
const { updateHomeForDevs } = require("./updateHomeForDevs");

let lastRun = 0

async function updateHomeForAllUsers() {
  if (new Date().getTime() - lastRun < 500) {
    console.log('Skipping home update for all users as it was run in the last 500ms')
    return
  }
  console.log('Updating home for all users')
  await updateHomeForDevs()
  await updateHomeForAnalysts()
  lastRun = new Date().getTime()
}

createCollectionListener('pipeline', updateHomeForAllUsers)
createCollectionListener('projects', updateHomeForAllUsers)
createCollectionListener('workflows', updateHomeForAllUsers)
createCollectionListener('user_config', updateHomeForAllUsers)
module.exports = updateHomeForAllUsers