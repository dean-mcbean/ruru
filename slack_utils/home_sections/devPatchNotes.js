const { bindAction } = require("../../webhook_handlers/slack/action_handler");
const { capitalize } = require("../message_blocks");
const { backToDefault } = require("../../webhook_handlers/slack/actions/back_to_default");

const projectsToTrack = ['risk-explorer', 'explorer-api', 'access-explorer', 'terraform-aws', 'cms']
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

async function devHomeForPatchNotes({user, bmb, sortedPRs}) {
  
  bmb.addButton({
    text: `:arrow_backward: Return`,
    action_id: bindAction(`back_to_default`, backToDefault),
    value: 'default'
  })
  .addHeader({
    text: `:memo: PRs by ${user.github_username}`
  })
  .addPadding({padding: 1})
  .addDivider()

  for (const project of projectsToTrack) {

    if (sortedPRs[project]) {
      bmb.addHeader({
        text: `${capitalize(project)}`
      });
      for (const stage of stagesToTrack) {
        bmb.addSection({
          text: `${stageEmojis[stage]} *${capitalize(stage)}*`
        });
        // convert last_workflow_run into a human readable "time ago" format
        const myPrs = sortedPRs[project][stage].filter((pr) => user.github_username === pr.user)
        const hasprs = myPrs && myPrs.length > 0
        if (hasprs) {
          let currentDate = '';
          for (let i = 0; i < myPrs.length; i += 10) {
            const prBatch = myPrs.slice(i, i + 10);
            let prText = ''
            for (const pr of prBatch) {
              const date = convertLastDatetime(`${pr.merged_at}`)
              prText += `${date !== currentDate ? date : '.          '}  :ruru-pull-request:  <${pr.url}|${pr.title}>\n`;
              currentDate = date
            }
            bmb.addSection({
              text: prText
            });
          }
          bmb.addPadding({padding: 6})
        }
      }
    }
  }
  bmb.addPadding({padding: 2})
  .addDivider()
  
  return bmb
}

module.exports = devHomeForPatchNotes