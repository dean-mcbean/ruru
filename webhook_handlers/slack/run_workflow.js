const { usePersistentItem } = require("../../storage_utils/persistent_item");

const requestRunWorkflow = async (action, data) => {
  const workflow_data = JSON.parse(action.value);
  console.log('Request to Running Workflow:', workflow_data, data.user);

  const userConfig = await usePersistentItem('user_config', data.user.id);
  
  await userConfig.set('home_view', 'workflow_request');
  await userConfig.set('workflow_request', workflow_data);
}

const runWorkflow = async (action, data) => {
  console.log('Running Workflow:', action.value);
  const userConfig = await usePersistentItem('user_config', data.user.id);
  await userConfig.set('home_view', 'default');
  await userConfig.set('workflow_request', undefined);
}

module.exports = {
  requestRunWorkflow,
  runWorkflow
};