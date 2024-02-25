const { getUsersInUsergroup } = require("../slack_dispatch/get_users_in_usergroup");
const getAllUsersDispatch = require("../slack_dispatch/get_all_users");

async function getDevUsers() {
  const users = await getUsersInUsergroup(process.env.DEVELOPER_USERGROUP);
  return users;
}

async function getAnalystUsers() {
  const users = await getUsersInUsergroup(process.env.ANALYST_USERGROUP);
  return users;
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