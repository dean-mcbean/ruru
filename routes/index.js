var express = require('express');
const handlePullRequestEvent = require('../webhook_handlers/github/pull_requests');
const { handleWorkflowRunEvent, handleWorkflowBotPushEvent } = require('../webhook_handlers/github/workflow_runs');
const { handleAction } = require('../webhook_handlers/slack/action_handler');
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
  for (const action of data.actions) {
    const result = await handleAction(action.action_id, action, data)
    console.log("RES", result)
    if (typeof result === 'object') {
      res.status(402).send(result);
    } else if (result) {
      res.status(200);
    } else {
      res.status(401);
    }
  }
  res.send();
});

module.exports = router;
