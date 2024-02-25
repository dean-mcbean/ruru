const { usePersistentItem } = require("../../../storage_utils/persistent_item");

const requestRunWorkflow = async (action, data) => {
  const workflow_data = JSON.parse(action.value);

  const userConfig = await usePersistentItem('user_config', data.user.id);
  
  await userConfig.set({
    ...data.user,
    ...await userConfig.get(),
    home_view: 'workflow_request',
    workflow_request: workflow_data
  })
}

const runWorkflow = async (action, data) => {
  console.log('Running Workflow:', action.value);
  const userConfig = await usePersistentItem('user_config', data.user.id);
  await userConfig.set('home_view', 'default');
  await userConfig.set('workflow_request', {});
}

module.exports = {
  requestRunWorkflow,
  runWorkflow
};