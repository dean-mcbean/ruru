const { bindAction } = require("../../webhook_handlers/slack/action_handler");
const { openUserSettings } = require("../../webhook_handlers/slack/actions/user_settings");
const { capitalize, createButtonBlock } = require("../message_blocks");


async function defaultHomeForAnalyst({user_name, bmb}) {
  
  bmb.addSection({
    text: `*Welcome, ${capitalize(user_name)} the Analyst!*`,
    accessory: createButtonBlock({
      text: `:gear: User Settings`,
      action_id: bindAction(`openUserSettings`, openUserSettings)
    })
  })
  .addPadding({padding: 1})
  .addDivider()
  
  return bmb
}

module.exports = defaultHomeForAnalyst