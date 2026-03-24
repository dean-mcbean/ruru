const {
  getUsersInUsergroup,
} = require("../../fetch/slack/get_users_in_usergroup");
const getAllUsersDispatch = require("../../fetch/slack/get_all_users");
const { getUserBySlackId } = require("../../utils/mongodb/get_user");

async function getDevUsers() {
  let users = await getUsersInUsergroup(process.env.DEVELOPER_USERGROUP);
  let db_users = [];
  for (const user of users) {
    const db_user = await getUserBySlackId(user.id);
    if (db_user) db_users.push(db_user);
  }
  return db_users;
}

async function getAnalystUsers() {
  let users = await getUsersInUsergroup(process.env.ANALYST_USERGROUP);
  let db_users = [];
  for (const user of users) {
    const db_user = await getUserBySlackId(user.id);
    if (db_user) db_users.push(db_user);
  }
  return db_users;
}

async function getAllUsers() {
  const users = await getAllUsersDispatch();
  return users.members;
}

module.exports = {
  getDevUsers,
  getAnalystUsers,
  getAllUsers,
};
