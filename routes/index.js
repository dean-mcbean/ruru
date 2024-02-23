var express = require('express');
const handlePullRequestEvent = require('../webhook_handlers/github/pull_requests');
const { addReviewerToPullRequest } = require('../webhook_handlers/slack/pull_requests');
const { handleWorkflowRunEvent, handleWorkflowBotPushEvent } = require('../webhook_handlers/github/workflow_runs');
const { requestRunWorkflow, runWorkflow } = require('../webhook_handlers/slack/run_workflow');
const { backToDefault } = require('../webhook_handlers/slack/back_to_default');
var router = express.Router();

/* POST from git. */
// eslint-disable-next-line no-unused-vars
router.post('/', async (req, res, next) => {
  res.status(400)

  // Pass to relevant webhook handler
  if (req.body.pull_request) {
    await handlePullRequestEvent(req.body)
    res.status(200)
  } else if (req.headers['x-github-event'] === 'ping ') {
    res.status(200)
  } else if (req.headers['x-github-event'] === 'workflow_run') {
    await handleWorkflowRunEvent(req.body)
    res.status(200)
  } else if (req.headers['x-github-event'] === 'push' && req.body.pusher.name === 'github-actions[bot]') {
    await handleWorkflowBotPushEvent(req.body)
    res.status(200)
  }

  
  res.send();
});

/* POST from slack. */
// eslint-disable-next-line no-unused-vars
router.post('/slack/', async (req, res, next) => {
  res.status(400)
  const data = JSON.parse(req.body.payload)

  // Pass actions to relevant webhook handler
  console.log(data);
  data.actions.forEach(action => {
    switch (action.action_id) { 

      case 'back_to_default':
        backToDefault(action, data);
        res.status(200);
        break;

      // PULL REQUESTS
      case 'pull_request.add_reviewer': 
        addReviewerToPullRequest(action, data); 
        res.status(200);
        break;

      // WORKFLOW RUNS
      case 'request_run_workflow':
        requestRunWorkflow(action, data);
        res.status(200);
        break;
      case 'run_workflow':
        runWorkflow(action, data);
        res.status(200);
        break;
    }
  })
  
  res.send();
});

module.exports = router;
