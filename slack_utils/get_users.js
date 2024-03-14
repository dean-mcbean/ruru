const { getUsersInUsergroup } = require("../slack_dispatch/get_users_in_usergroup");
const getAllUsersDispatch = require("../slack_dispatch/get_all_users");
const { getUserBySlackId } = require("../storage_utils/get_user");

async function getDevUsers() {
  let users = await getUsersInUsergroup(process.env.DEVELOPER_USERGROUP);
  let db_users = []
  for (const user of users) {
    const db_user = await getUserBySlackId(user.id);
    db_users.push(db_user)
  }
  return db_users;
}

async function getAnalystUsers() {
  let users = await getUsersInUsergroup(process.env.ANALYST_USERGROUP);
  let db_users = []
  for (const user of users) {
    const db_user = await getUserBySlackId(user.id);
    db_users.push(db_user)
  }
  return db_users;
}

async function getAllUsers() {
  const users = await getAllUsersDispatch()
  return users.members
}


module.exports = {
  getDevUsers,
  getAnalystUsers,
  getAllUsers
}