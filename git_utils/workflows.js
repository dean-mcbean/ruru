/* const axios = require('axios');

let lastRun = 0
let lastWorkflows = []
 */
const getRecentActionRuns = async (/* repo */) => {
  // DISABLED FOR THE MOMENT
  return []
/*   if (new Date().getTime() - lastRun < 1000 * 60 * 5) {
    console.log('Skipping loading workflows as it was run in the last 5 minutes')
    return [...lastWorkflows]
  }
  const workflow_runs = []
  let page = 1
  while (workflow_runs.length < 100 && page < 10 && (lastWorkflows.length == 0 || workflow_runs[workflow_runs.length - 1]?.merged_at > lastWorkflows[0]?.merged_at)) {
    console.log('Loading Workflows: ', workflow_runs.length + '%')
    const url = `https://api.github.com/repos/uintel/${repo}/actions/runs?per_page=100&page=${page}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });
    workflow_runs.push(...response.data.workflow_runs.filter(run => run.name.startsWith('Deploy')).map(run => {
      return {
        id: run.id,
        name: run.name,
        ran_by: run.actor.login,
        status: run.status,
        conclusion: run.conclusion,
        created_at: new Date(run.created_at),
        updated_at: new Date(run.updated_at),
        html_url: run.html_url,
      };
    }))
    page++;
  }
  workflow_runs.sort((b, a) => b.created_at - a.created_at)
  if (lastWorkflows.length !== 0 && (workflow_runs.length === 0 || workflow_runs[workflow_runs.length - 1]?.merged_at < lastWorkflows[0]?.merged_at)) {
    workflow_runs.push(...lastWorkflows.filter(run => workflow_runs.length === 0 || run.merged_at < workflow_runs[workflow_runs.length - 1]?.merged_at))
  }
  console.log('Loading Workflows: 100%')
  lastWorkflows = [...workflow_runs]
  lastRun = new Date().getTime()
  return workflow_runs; */
};

module.exports = { getRecentActionRuns };