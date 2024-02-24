const updateHome = require("../slack_dispatch/update_home")
const getDevUserIds = require("../slack_utils/get_userids");
const { workflowRequestHomeForDev } = require("../slack_utils/home_sections/workflowRequest");
const { BlockMessageBuilder, createButtonBlock, capitalize } = require("../slack_utils/message_blocks");
const { usePersistentItem, createCollectionListener } = require("../storage_utils/persistent_item");
const { bindAction } = require("../webhook_handlers/slack/action_handler");
const { requestRunWorkflow } = require("../webhook_handlers/slack/actions/run_workflow");

const projectsToTrack = ['risk-explorer', 'explorer-api']
const stagesToTrack = ['dev', 'test', 'apps']
const stageEmojis = {
  dev: ':construction:',
  test: ':test_tube:',
  apps: ':rocket:'
}

async function defaultHomeForDev({user_name, bmb}) {
  
  bmb.addSection({
    text: `*Welcome, ${capitalize(user_name)}!*`
  })
  .addPadding({padding: 1})
  .addDivider()

  for (const project of projectsToTrack) {
    const stages = await usePersistentItem('projects', project, 'stages');
    const stages_value = await stages.get();

    if (stages_value && Object.keys(stages_value).length > 0) {
      bmb.addHeader({
        text: `${capitalize(project)} Status`
      });
      for (const stage of stagesToTrack) {
        if (!stages_value[stage]) {
          stages_value[stage] = {
            last_workflow_run: 'Never',
            ran_by: 'N/A',
            version: 'Unknown'
          }
        }
        bmb.addSection({
          text: `*${stageEmojis[stage]}   ${capitalize(stage)}*
          Last Workflow Run: ${stages_value[stage].last_workflow_run}
          Ran By: ${stages_value[stage].ran_by}
          Version: ${stages_value[stage].version}`,
          accessory: createButtonBlock({
            text: `:package:`,
            action_id: bindAction(`request_run_workflow`, requestRunWorkflow),
            value: JSON.stringify({
              workflow: 'deploy',
              project,
              stage
            })
          })
        });
      }
    } else {
      bmb.addHeader({
        text: `${capitalize(project)} Status`
      });
      bmb.addSection({
        text: `  
        _No workflow runs have been recorded for this project_`
      });
    }
    bmb.addPadding({padding: 2})
    .addDivider()
  }
  
  return bmb
}


async function buildHomeForDev({user_name, user_id}) {
  // Builds the home for a specific user
  const userConfig = await usePersistentItem('user_config', user_id);
  const userConfigValue = await userConfig.get();
  let bmb = new BlockMessageBuilder()

  if (userConfigValue && userConfigValue.home_view === 'workflow_request') {
    bmb = await workflowRequestHomeForDev({bmb, 
      workflow_request: userConfigValue.workflow_request})
  } else {
    bmb = await defaultHomeForDev({user_name, bmb})
  }

  bmb.addContext({
    text: `_Last Updated: ${new Date().toLocaleString()}_`
  })

  return bmb.build()
}

async function updateHomeForDevs() {
  Object.entries(getDevUserIds()).forEach(async ([user_name, user_id]) => {
    await updateHome({
      user_id,
      blocks: await buildHomeForDev({
        user_name,
        user_id
      })
    })
  })
}

createCollectionListener('projects', updateHomeForDevs)
createCollectionListener('workflows', updateHomeForDevs)
createCollectionListener('user_config', updateHomeForDevs)
module.exports = updateHomeForDevs