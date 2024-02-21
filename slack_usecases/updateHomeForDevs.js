const updateHome = require("../slack_dispatch/update_home")
const { BlockMessageBuilder } = require("../slack_utils/message_blocks")

function updateHomeForDevs() {
  // Updates the homepage of this app for a specific user

  const bmb = BlockMessageBuilder()

  bmb.addSectionBlock({
    text: "Welcome to the Dev Home!"
  })

  process.env.DEV_USERIDS.forEach(async (user_id) => {
    await updateHome({
      user_id,
      blocks: bmb.build()
    })
  })
}

module.exports = updateHomeForDevs