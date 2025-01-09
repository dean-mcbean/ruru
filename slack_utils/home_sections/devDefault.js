const { usePersistentItem } = require("../../storage_utils/persistent_item");
const { bindAction } = require("../../webhook_handlers/slack/action_handler");
const { openUserSettings } = require("../../webhook_handlers/slack/actions/user_settings");
const { openPatchNotes } = require("../../webhook_handlers/slack/actions/patch_notes");
const { capitalize, createButtonBlock } = require("../message_blocks");

const projectsToTrack = ['risk-explorer', 'explorer-api', 'access-explorer', 'terraform-aws']
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

async function defaultHomeForDev({user_name, bmb, sortedPRs, sortedDeploys}) {
  if (!sortedPRs) return bmb.addSection({
    text: `*Welcome, ${capitalize(user_name)}! I've been told you're a developer, but it looks like you're not!*`})
  
  const pipelineStatus = await usePersistentItem('pipeline', 'status');
  const pipelineStatusValue = await pipelineStatus.get();
  bmb.addSection({
    text: `*Welcome, ${capitalize(user_name)} the Developer!*`,
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
  .addDivider();
  


  for (const project of projectsToTrack) {
    const stages = await usePersistentItem('projects', project, 'stages');
    const stages_value = await stages.get();

    if (sortedDeploys[project] && sortedPRs[project]) {
      bmb.addHeader({
        text: `${capitalize(project)} Status`
      });
      for (const stage of stagesToTrack) {
        let lastDeploy = 'Never';
        let ranBy = 'N/A';
        let version = 'Unknown';
        if (sortedDeploys[project][stage]) {
          ranBy = sortedDeploys[project][stage].ran_by;
          lastDeploy = convertLastDatetime(`${sortedDeploys[project][stage].created_at}`);
        }
        if (stages_value[stage]) {
          version = stages_value[stage].version;
        }

        const hasprs = sortedPRs[project] && sortedPRs[project][stage].length > 0
        bmb.addSection({
          text: `*${stageEmojis[stage]}  ${capitalize(stage)}*       :ruru-version: ${version}    :ruru-clock: ${lastDeploy}    :ruru-user: ${ranBy}
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
        const prs = sortedPRs[project][stage];
        let currentDate = '';
        for (let i = 0; i < prs.length; i += 10) {
          const prBatch = prs.slice(i, i + 10);
          let prText = ''
          for (const pr of prBatch) {
            const date = convertLastDatetime(`${pr.merged_at}`)
            prText += `${date !== currentDate ? date : '.          '}  :ruru-pull-request:  <${pr.url}|${pr.title}> - ${pr.user}\n`;
            currentDate = date
          }
          bmb.addSection({
            text: prText
          });
        }

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