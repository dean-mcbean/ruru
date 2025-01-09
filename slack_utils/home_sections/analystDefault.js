const { bindAction } = require("../../webhook_handlers/slack/action_handler");
const { openUserSettings } = require("../../webhook_handlers/slack/actions/user_settings");
const { capitalize, createButtonBlock } = require("../message_blocks");
const { usePersistentItem } = require("../../storage_utils/persistent_item");

async function defaultHomeForAnalyst({user_name, bmb}) {
  
  const { openPatchNotes } = require("../../webhook_handlers/slack/actions/patch_notes");
  const pipelineStatus = await usePersistentItem('pipeline', 'status');
  const pipelineStatusValue = await pipelineStatus.get();
  bmb.addSection({
    text: `*Welcome, ${capitalize(user_name)} the Analyst!*`,
    accessory: createButtonBlock({
      text: `:gear: User Settings`,
      action_id: bindAction(`openUserSettings`, openUserSettings)
    })
  })
  .addSection({
    text: `*Pipeline Status*${
      pipelineStatusValue ? 
      Object.entries(pipelineStatusValue).reduce((acc, [key, value]) => 
        key !== '_id' ? `${acc}\n ● *${key}:* ${value.status} (${new Date(value.lastUpdated).toLocaleString()})` : acc, ''
      )
       : 
      '_No pipeline status has been recorded_'
    }`,
    accessory: createButtonBlock({
      text: `:clipboard: Your PRs`,
      action_id: bindAction(`openPatchNotes`, openPatchNotes)
    })
  })
  .addPadding({padding: 1})
  .addDivider()
  
  return bmb
}

module.exports = defaultHomeForAnalyst