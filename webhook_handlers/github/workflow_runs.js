/* eslint-disable no-unused-vars */
const { downloadArtifact } = require("../../git_utils/artifacts");
const sendMessage = require("../../slack_dispatch/send_message");
const { BlockMessageBuilder } = require("../../slack_utils/message_blocks");
const { usePersistentItem } = require("../../storage_utils/persistent_item");
const fs = require('fs');


const handleWorkflowRunEvent = async (data) => {
  // fetch persistent storage
  const workflowStatus = await usePersistentItem('workflows', 'workflow_status', data.workflow_run.head_sha);
  const workflowStatusValue = await workflowStatus.get();

  const stage = {
    DeployToDev: 'dev',
    DeployToTest: 'test',
    DeployToApps: 'apps',
  }[data.workflow_run.name];

  if (!stage) {
    return;
  }

  const previousStage = {
    DeployToDev: undefined,
    DeployToTest: 'dev',
    DeployToApps: 'test',
  }[data.workflow_run.name];

  const project = data.repository.name;

  if (data.action === 'in_progress' && stage !== undefined) {

    await workflowStatus.set({
      status: 'in_progress',
      head_sha: data.workflow_run.head_sha,
      workflow_id: data.workflow_run.id,
      stage
    });
    console.log('Workflow In Progress:', await workflowStatus.get());
    
  } else if (data.action === 'completed') {
    await workflowStatus.set('status', 'completed');
    console.log('Workflow Completed:', await workflowStatus.get());

    const rexStages = await usePersistentItem('projects', project, 'stages');
    const rexStagesValue = await rexStages.get();

    const updatedDate = new Date(data.workflow_run.updated_at);
    const formattedDate = updatedDate.toLocaleString('en-NZ', {
      day: '2-digit',
      month: '2-digit',
    });
    
    if (workflowStatusValue) {
      console.log('Workflow Status:', workflowStatusValue);
      console.log(rexStagesValue)
      console.log(previousStage)
      await rexStages.set(workflowStatusValue.stage, {
        last_workflow_run: formattedDate,
        ran_by: data.sender.login,
        version: rexStagesValue[workflowStatusValue.stage] ? rexStagesValue[workflowStatusValue.stage].version : 'Unknown',
        prs: [...(rexStagesValue[previousStage] && rexStagesValue[previousStage].prs ? rexStagesValue[previousStage].prs : []), ...(rexStagesValue[stage].prs ? rexStagesValue[stage].prs : [])]
      });

      console.log(rexStagesValue)
      if (rexStagesValue[previousStage] && rexStagesValue[previousStage].prs) {
        await rexStages.set(previousStage, {
          ...rexStagesValue[previousStage],
          prs: []
        });
      }
    }
  }
}

const handleWorkflowBotPushEvent = async (data) => {
  // fetch persistent storage

  const workflowStatus = await usePersistentItem('workflows','workflow_status', data.head_commit.id);
  const workflowStatusValue = await workflowStatus.get();

  const versionNumber = data.ref.split('/').pop();
  await workflowStatus.set('version', versionNumber);
  console.log('Workflow Push:', workflowStatusValue);
}

const updateStageVersion = async (data) => {
  const repo = data.repo;
  const stage = data.stage;
  const version = data.version;

  const rexStages = await usePersistentItem('projects', repo, 'stages');
  const rexStagesValue = await rexStages.get();

  if (rexStagesValue && rexStagesValue[stage]) {
    await rexStages.set(stage, {
      last_workflow_run: rexStagesValue[stage].last_workflow_run,
      ran_by: rexStagesValue[stage].ran_by,
      version
    });
  } else {
    await rexStages.set(stage, {
      last_workflow_run: 'Unknown',
      ran_by: 'Unknown',
      version
    });
  }
}

function formatTestResults(testJson) {
  if (!testJson || !testJson.stats) return ' - Unknown error occurred\n';
  let result = '';
  if (testJson.stats.expected > 0) result += ` - ${testJson.stats.expected} tests passed\n`;
  if (testJson.stats.unexpected > 0) result += ` - ${testJson.stats.unexpected} tests failed\n`;
  if (testJson.stats.skipped > 0) result += ` - ${testJson.stats.skipped} tests skipped\n`;
  if (testJson.stats.flaky > 0) result += ` - ${testJson.stats.flaky} tests were flaky\n`;
  return result;
}

const handlePlaywrightTestEvent = async (data, triggering_workflow, workflow_id) => {
  if (data === 'WorkflowFailed') {
    const blocks = new BlockMessageBuilder();
    blocks.addHeader({text: `:mild_panic: *Workflow "${triggering_workflow}" Failed!*`});
    await sendMessage({
      channel: process.env.DEV_CHAT_CHANNELID, 
      blocks: blocks.build(),
      text: `Workflow Failed!`
    })
    return;
  }

  const filePath = 'public/data/last-playwright-test.json';

  fs.writeFile(filePath, JSON.stringify(data), (err) => {
    if (err) {
      console.error('Error writing JSON file:', err);
    } else {
      console.log('JSON file saved successfully');
    }
  });

  const shouldSend = !data || !data.stats || data.stats.unexpected > 0 || data.stats.flaky > 0;

  await downloadArtifact(workflow_id, 'playwright-report', 'risk-explorer');

  
  if (shouldSend) {
    const message = formatTestResults(data);
  
    const blocks = new BlockMessageBuilder();
    blocks.addSection({text: `:mild_panic: *Playwright Tests Failed for workflow ${triggering_workflow}*`});
    blocks.addSection({text: message});
  
    // Send message to slack
    await sendMessage({
      channel: process.env.DEV_CHAT_CHANNELID, 
      blocks: blocks.build(),
      text: `Playwright Tests Failed!`
    })
  }
  
  /*  else {
    const blocks = new BlockMessageBuilder();
    blocks.addSection({text: `*Playwright Tests Passed for workflow ${triggering_workflow}*`});
    
    await sendMessage({
      channel: process.env.DEV_CHAT_CHANNELID, 
      blocks: blocks.build(),
      text: `Playwright Tests Passed!`
    })
  } */
}

module.exports = {
  handleWorkflowRunEvent,
  handleWorkflowBotPushEvent,
  updateStageVersion,
  handlePlaywrightTestEvent
}