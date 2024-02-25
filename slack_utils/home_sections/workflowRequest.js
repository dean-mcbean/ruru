const { usePersistentItem } = require("../../storage_utils/persistent_item")
const { bindAction } = require("../../webhook_handlers/slack/action_handler")
const { backToDefault } = require("../../webhook_handlers/slack/actions/back_to_default")
const { runWorkflow } = require("../../webhook_handlers/slack/actions/run_workflow")
const { createButtonBlock, capitalize } = require("../message_blocks")

async function selectVersionAction(action) {
  console.log('Select Version Action', action)
  const value = action.selected_option.value

  const isValidNumber = (value) => {
    const regex = /^\d+(\.\d+){2}$/;
    return regex.test(value);
  };
  
  if (isValidNumber(value)) {
    const userConfig = await usePersistentItem('user_config', action.user.id);
    await userConfig.set('workflow_request', {version: value})
  } else {
    return {
      response_action: 'errors',
      errors: {
        version: 'Please enter a valid version number'
      }
    }
  }
}

async function workflowRequestHomeForDev({workflow_request, bmb}) {
  console.log('Workflow Request Home', workflow_request)
  if ('risk-explorer' !== workflow_request.project) {
    return bmb.addButton({
      text: `:arrow_backward: Return`,
      action_id: bindAction(`back_to_default`, backToDefault),
      value: 'default'
    })
    .addHeader({
      text: `*Sorry!*`
    })
    .addSection({
      text: `*${workflow_request.project}* is not yet supported by Ruru.`
    })
  }
  
  const stages = await usePersistentItem('projects', 'risk-explorer', 'stages');
  const stages_value = await stages.get();

  let current_versions = ''
  
  for (const stage of ['dev', 'test', 'apps']) {
    if (!stages_value[stage]) {
      stages_value[stage] = {
        last_workflow_run: 'Never',
        ran_by: 'N/A',
        version: 'Unknown'
      }
    }
    current_versions += `*${capitalize(stage)}:* _${stages_value[stage].version}_             `
  }

  bmb.addButton({
    text: `:arrow_backward: Return`,
    action_id: bindAction(`back_to_default`, backToDefault),
    value: 'default'
  })
  .addHeader({
    text: `Deploy ${capitalize(workflow_request.project)} to ${capitalize(workflow_request.stage)}`
  })
  .addSection({
    text: `_Please be sure to review any changes before deploying!_`
  })
  if (workflow_request.stage !== 'dev') {
    bmb.addTextInput({
      label: 'Version',
      action_id: bindAction(`select_version`, selectVersionAction),
      placeholder: 'Enter a version number'
    })
  }
  bmb.addSection({
    text: ' ',
    accessory: createButtonBlock({
      text: `:gear: Start Workflow`,
      action_id: bindAction(`run_workflow`, runWorkflow),
      value: JSON.stringify(workflow_request)
    })
  })
  .addPadding({padding: 2})
  .addDivider()
  .addContext({
    text: `_Current Stage Versions:_`
  })
  .addSection({
    text: current_versions,
  })
  .addPadding({padding: 2})
  .addDivider()

  return bmb
}

module.exports = {
  workflowRequestHomeForDev
};