const updateHome = require("../slack_dispatch/update_home")
const getDevUserIds = require("../slack_utils/get_userids")
const { BlockMessageBuilder, createButtonBlock } = require("../slack_utils/message_blocks");
const { usePersistentItem, createStorageListener } = require("../storage_utils/persistent_item");

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const projectsToTrack = ['risk-explorer', 'explorer-api']
const stagesToTrack = ['dev', 'test', 'apps']

async function defaultHomeForDev({user_name, bmb}) {
  
  bmb.addSection({
    text: `*Welcome, ${capitalize(user_name)}!*`
  })
  .addPadding({padding: 1})
  .addDivider()

  for (const project of projectsToTrack) {
    const stages = await usePersistentItem('projects', project, 'stages');

    if (stages.value && Object.keys(stages.value).length > 0) {
      bmb.addHeader({
        text: `${capitalize(project)} Status`
      });
      for (const stage of stagesToTrack) {
        if (!stages.value[stage]) {
          stages.value[stage] = {
            last_workflow_run: 'Never',
            ran_by: 'N/A',
            version: 'Unknown'
          }
        }
        bmb.addSection({
          text: `*${capitalize(stage)}*
          Last Workflow Run: ${stages.value[stage].last_workflow_run}
          Ran By: ${stages.value[stage].ran_by}
          Version: ${stages.value[stage].version}`,
          accessory: createButtonBlock({
            text: `Deploy to ${capitalize(stage)}`,
            action_id: `request_run_workflow`,
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

async function workflowRequestHomeForDev({workflow_request, bmb}) {
  bmb.addButton({
    text: `:arrow_backward: Return`,
    action_id: `back_to_default`,
    value: 'default'
  })
  .addHeader({
    text: `Deploy ${capitalize(workflow_request.project)} to ${capitalize(workflow_request.stage)}`
  })
  .addSection({
    text: `_Please be sure to review any changes before deploying!_`
  })
  .addActions({
    elements: [
      createButtonBlock({
        text: `:gear: Start Workflow`,
        action_id: `run_workflow`,
        value: JSON.stringify(workflow_request)
      })
    ]
  })
  .addPadding({padding: 2})
  .addDivider()

  return bmb
}

async function buildHomeForDev({user_name, user_id}) {
  // Builds the home for a specific user
  const userConfig = await usePersistentItem('user_config', user_id);
  let bmb = new BlockMessageBuilder()

  if (userConfig.value && userConfig.value.home_view === 'workflow_request') {
    bmb = await workflowRequestHomeForDev({bmb, 
      workflow_request: userConfig.value.workflow_request})
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

createStorageListener('projects', updateHomeForDevs)
createStorageListener('workflows', updateHomeForDevs)
createStorageListener('user_config', updateHomeForDevs)
module.exports = updateHomeForDevs