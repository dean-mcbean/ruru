const {
  DEVELOPER_GITHUB_REPOS_EFFECTIVE,
  ANALYST_GITHUB_REPOS,
} = require("../../constants");

function getUsergroupRepos(usergroup) {
  switch (usergroup) {
    case "analysts":
      return ANALYST_GITHUB_REPOS.length > 0
        ? ANALYST_GITHUB_REPOS
        : ["your-docs-repo"];
    case "developers":
      return DEVELOPER_GITHUB_REPOS_EFFECTIVE;
    default:
      return [];
  }
}

module.exports = {
  getUsergroupRepos,
};
