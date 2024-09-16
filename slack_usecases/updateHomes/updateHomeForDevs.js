const updateHome = require("../../slack_dispatch/update_home");
const { getDevUsers } = require("../../slack_utils/get_users");
const defaultHomeForDev = require("../../slack_utils/home_sections/devDefault");
const devHomeForPatchNotes = require("../../slack_utils/home_sections/devPatchNotes");
const { userSettings } = require("../../slack_utils/home_sections/userSettings");
const { workflowRequestHomeForDev } = require("../../slack_utils/home_sections/workflowRequest");
const { BlockMessageBuilder } = require("../../slack_utils/message_blocks");
const { usePersistentItem } = require("../../storage_utils/persistent_item");
const { fetchRecentlyMergedPRs } = require("../../git_utils/pull_requests");
const { getRecentActionRuns } = require("../../git_utils/workflows");



async function buildHomeForDev({user_name, user_id, sortedPRs, sortedDeploys}) {
  // Builds the home for a specific user
  const userConfig = await usePersistentItem('user_config', user_id);
  const userConfigValue = await userConfig.get();
  let bmb = new BlockMessageBuilder()

  if (userConfigValue && userConfigValue.home_view === 'workflow_request') {
    bmb = await workflowRequestHomeForDev({bmb, 
      workflow_request: userConfigValue.workflow_request})

  } else if (userConfigValue && userConfigValue.home_view === 'user_settings') {
    bmb = await userSettings({bmb, userConfigValue})

  } else if (userConfigValue && userConfigValue.home_view === 'patch_notes') {
    bmb = await devHomeForPatchNotes({user: userConfigValue, bmb, sortedPRs})

  } else {
    bmb = await defaultHomeForDev({user_name, bmb, sortedPRs, sortedDeploys})
  }

  bmb.addContext({
    text: `_Last Updated: ${new Date().toLocaleString()}_`
  })

  return bmb.build()
}

function sortPRsByWorkflows(prs, workflows) {
  prs.sort((b, a) => a.merged_at - b.merged_at)
  workflows.sort((b, a) => a.created_at - b.created_at)
  const deploys = workflows.filter((workflow) => workflow.name.startsWith('Deploy') && workflow.name !== 'DeployToDev');
  const currentStages = {
    currentlyDev: 'becomesDev',
    currentlyTest: 'becomesTest',
    currentlyApps: 'becomesApps',
  }
  const sortedPRs = {
    dev: [],
    test: [],
    apps: []
  }
  const sortedDeploys = {
    dev: workflows.filter((workflow) => workflow.name === 'DeployToDev')[0],
    test: null,
    apps: null
  }
  for (const pr of prs) {
    if (deploys.length > 0 && pr.merged_at < deploys[0].created_at) {
      if (deploys[0].name === 'DeployToTest') {
        if (sortedDeploys.test == null) {
          sortedDeploys.test = deploys[0]
        }
        currentStages.currentlyDev = currentStages.currentlyTest
        currentStages.currentlyTest = null
      } else if (deploys[0].name === 'DeployToApps') {
        if (sortedDeploys.apps == null) {
          sortedDeploys.apps = deploys[0]
        }
        currentStages.currentlyTest = currentStages.currentlyApps
        currentStages.currentlyApps = null
      }
      deploys.shift()
    }
    if (currentStages.currentlyDev == 'becomesDev') {
      sortedPRs.dev.push(pr)
    } else if (currentStages.currentlyDev == 'becomesTest') {
      sortedPRs.test.push(pr)
    } else if (currentStages.currentlyDev == 'becomesApps') {
      sortedPRs.apps.push(pr)
    }
    if (currentStages.currentlyDev == null) {
      break
    }
  }
  return [sortedPRs, sortedDeploys]
}
async function updateHomeForDevs() {
  const dev_users = await getDevUsers();
  const recentWorkflowsPromise = getRecentActionRuns('risk-explorer');
  const recentPRsPromise = fetchRecentlyMergedPRs('risk-explorer');
  const [recentWorkflows, recentPRs] = await Promise.all([recentWorkflowsPromise, recentPRsPromise]);
  const [sortedPRs, sortedDeploys] = sortPRsByWorkflows(recentPRs, recentWorkflows);

  const updateHomePromises = dev_users.map(async (user) => {
    await updateHome({
      user_id: user.id,
      blocks: await buildHomeForDev({
        user_name: user.profile.first_name,
        user_id: user.id,
        sortedPRs: {
          'risk-explorer': sortedPRs
        },
        sortedDeploys: {
          'risk-explorer': sortedDeploys
        }
      }),
    });
  });

  await Promise.all(updateHomePromises);
}

module.exports = {
  updateHomeForDevs,
  buildHomeForDev
}