const { usePersistentItem } = require("../../storage_utils/persistent_item");
const { bindAction } = require("../../webhook_handlers/slack/action_handler");
const { openUserSettings } = require("../../webhook_handlers/slack/actions/user_settings");
const { capitalize, createButtonBlock } = require("../message_blocks");

const projectsToTrack = ['risk-explorer', 'explorer-api']
const stagesToTrack = ['dev', 'test', 'apps']
const stageEmojis = {
  dev: ':construction:',
  test: ':test_tube:',
  apps: ':rocket:'
}

function convertLastDatetime (datetime) {
  if (datetime.length < 10) return datetime
  const lastRunDate = new Date(datetime.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{1,2}):(\d{2}) (am|pm)/, "$2/$1/$3 $4:$5 $6"));
  return lastRunDate.toLocaleString('en-NZ', {
    day: '2-digit',
    month: '2-digit'
  });
}

async function defaultHomeForDev({user_name, bmb}) {
  
  bmb.addSection({
    text: `*Welcome, ${capitalize(user_name)} the Developer!*`,
    accessory: createButtonBlock({
      text: `:gear: User Settings`,
      action_id: bindAction(`openUserSettings`, openUserSettings)
    })
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
        // convert last_workflow_run into a human readable "time ago" format
        
        const timeAgo = convertLastDatetime(stages_value[stage].last_workflow_run);
        const hasprs = stages_value[stage].prs && stages_value[stage].prs.length > 0
        bmb.addSection({
          text: `*${stageEmojis[stage]}  ${capitalize(stage)}*       :ruru-version: ${stages_value[stage].version}    :ruru-clock: ${timeAgo}    :ruru-user: ${stages_value[stage].ran_by}
  
${hasprs ? stages_value[stage].prs.map(pr => `      :ruru-pull-request:  <${pr.url}|${pr.title}> - ${pr.user}`).join('\n') : ''}
`,
          accessory: (stage !== 'dev' ? createButtonBlock({
            text: `:ruru-deploy:`,
            url: `https://github.com/uintel/risk-explorer/actions/workflows/DeployTo${capitalize(stage)}.yml`,
            /* action_id: bindAction(`request_run_workflow`, requestRunWorkflow),
            value: JSON.stringify({
              workflow: 'deploy',
              project,
              stage
            }) */
          }) : undefined)
        });
        if (hasprs) {
          bmb.addPadding({padding: 6})
        }
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

module.exports = defaultHomeForDev