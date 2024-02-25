
const boundActions = {}

const bindAction = (action_id, handler) => {
  boundActions[action_id] = handler
  return action_id
}

const handleAction = async (action_id, action, data) => {
  if (boundActions[action_id]) {
    const result = await boundActions[action_id](action, data)
    if (typeof result === 'object') {
      // Code to handle when result is an object
      return result
    }
    return true
  }
  return false
}

module.exports = {
  bindAction,
  handleAction
}