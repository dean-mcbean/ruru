

function getUsergroupRepos (usergroup) {

  switch (usergroup) {
    case 'analysts':
      return ['t-rex'];
    case 'developers':
      return ['risk-explorer','explorer-api', 'ui-component-library', 'access-explorer'];
    default:
      return [];
  }
}

module.exports = {
  getUsergroupRepos
}