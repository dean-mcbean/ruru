

function getDevUserIds() {
  return JSON.parse(process.env.DEV_USERIDS)
}

module.exports = getDevUserIds