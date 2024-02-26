const { usePersistentItem } = require("../../storage_utils/persistent_item");

async function settingsHome({user, bmb}) {
  const userConfig = await usePersistentItem('user_config', user.id);
  
  bmb.addButton({
    text: `:arrow_backward: Return`,
    action_id: bindAction(`back_to_default`, backToDefault),
    value: 'default'
  })
  .addPadding({padding: 1})
  .addDivider()
  .addActions({
    elements: [
      {
        type: 'button',
        text: `:gear: Deploy Risk Explorer to Dev`,
        action_id: bindAction(`deploy_dev`, deployDev),
        value: 'risk-explorer'
      },
      {
        type: 'button',
        text: `:gear: Deploy Risk Explorer to Test`,
        action_id: bindAction(`deploy_test`, deployTest),
        value: 'risk-explorer'
      },
      {
        type: 'button',
        text: `:gear: Deploy Risk Explorer to Apps`,
        action_id: bindAction(`deploy_apps`, deployApps),
        value: 'risk-explorer'
      }
    ]
  })
  .addDivider()
  .addPadding({padding: 1})
}

module.exports = {
  settingsHome,
};