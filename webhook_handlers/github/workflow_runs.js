const { usePersistentItem } = require("../../storage_utils/persistent_item");


const handleWorkflowRunEvent = async (data) => {
  // fetch persistent storage
  const workflowStatus = await usePersistentItem('workflows', 'workflow_status', data.workflow_run.head_sha);

  const stage = {
    DeployToDev: 'dev',
    DeployToTest: 'test',
    DeployToApps: 'apps',
  }[data.workflow_run.name];

  const project = data.repository.name;

  if (data.action === 'in_progress' && stage !== undefined) {

    await workflowStatus.set({
      status: 'in_progress',
      head_sha: data.workflow_run.head_sha,
      workflow_id: data.workflow_run.id,
      stage
    });
    console.log('Workflow In Progress:', workflowStatus.value);
    
  } else if (data.action === 'completed') {
    await workflowStatus.set('status', 'completed');
    console.log('Workflow Completed:', workflowStatus.value);

    const rexStages = await usePersistentItem('projects', project, 'stages');

    const updatedDate = new Date(data.workflow_run.updated_at);
    const formattedDate = updatedDate.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    await rexStages.set(workflowStatus.value.stage, {
      last_workflow_run: formattedDate,
      ran_by: data.sender.login,
      version: workflowStatus.value.version
    });
  }
}

const handleWorkflowBotPushEvent = async (data) => {
  // fetch persistent storage

  const workflowStatus = await usePersistentItem('workflows','workflow_status', data.head_commit.id);

  const versionNumber = data.ref.split('/').pop();
  await workflowStatus.set('version', versionNumber);
  console.log('Workflow Push:', workflowStatus.value);
}

module.exports = {
  handleWorkflowRunEvent,
  handleWorkflowBotPushEvent
}