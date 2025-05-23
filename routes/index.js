var express = require('express');
const { handleWorkflowRunEvent, handleWorkflowBotPushEvent, updateStageVersion, handlePlaywrightTestEvent } = require('../webhook_handlers/github/workflow_runs');
const { handleAction } = require('../webhook_handlers/slack/action_handler');
const { handleIssuePullRequestEvent, handlePullRequestEvent } = require('../webhook_handlers/github/pull_requests');
const { handleSessionCall } = require('../webhook_handlers/explorer-api/sessions');
const { handleIssueEvent } = require('../webhook_handlers/github/issues');
const { handleNewBranchEvent } = require('../webhook_handlers/github/new_branch');
const { usePersistentItem } = require("../storage_utils/persistent_item");
var router = express.Router();

/* POST from git. */
// eslint-disable-next-line no-unused-vars
router.post('/', async (req, res, next) => {
  res.status(400)


  // Pass to relevant webhook handler
  if (req.query.source === 'playwright') {
    console.log(req.query)
    await handlePlaywrightTestEvent(req.body, req.query.triggering_workflow, req.query.workflow_id)
    res.status(200)

  } else if (req.body.pull_request) {
    await handlePullRequestEvent(req.body)
    res.status(200)

  } else if (req.body.issue) {
    if (req.body.issue.pull_request) {
      // if this issue is actually a pull request
      await handleIssuePullRequestEvent(req.body)
      res.status(200)
    } else {
      await handleIssueEvent(req.body)
      res.status(200)
    }
  } else if (req.headers['x-github-event'] === 'ping ') {
    res.status(200)
  } else if (req.headers['x-github-event'] === 'workflow_run') {
    await handleWorkflowRunEvent(req.body)
    res.status(200)
  } else if (req.headers['x-github-event'] === 'push' && req.body.pusher.name === 'github-actions[bot]') {
    await handleWorkflowBotPushEvent(req.body)
    res.status(200)
  } else if (req.headers['x-github-event'] === 'create' && req.body.ref_type === 'branch') {
    // handle branch created event
    await handleNewBranchEvent(req.body)
    res.status(200);
  }

  
  res.send();
});

// eslint-disable-next-line no-unused-vars
router.post('/curl/', async (req, res, next) => {
  res.status(400)

  console.log(req.body)
  let data = req.body

  if (!data.type) {
    const jsonString = Object.keys(req.body)[0];
    // Parse the JSON string into an object
    data = JSON.parse(jsonString);
  }

  console.log(data)

  if (data.type === 'update_version') {
    await updateStageVersion(data)
    res.status(200)
  }

  res.send();
})


/* POST from slack. */
// eslint-disable-next-line no-unused-vars
router.post('/slack/', async (req, res, next) => {
  res.status(400)
  const data = JSON.parse(req.body.payload)

  // Pass actions to relevant webhook handler
  for (const action of data.actions) {
    const result = await handleAction(action.action_id, action, data)
    if (typeof result === 'object') {
      res.status(402).send(result);
    } else if (result) {
      res.status(200);
    } else {
      res.status(200);
    }
  }
  res.send();
});

/* POST from slack. */
// eslint-disable-next-line no-unused-vars
router.post('/pipeline/', async (req, res, next) => {
  res.status(400)
  const pipelineStatus = await usePersistentItem('pipeline', 'status');
  await pipelineStatus.set(req.body.client, {
    status: req.body.event,
    lastUpdated: new Date().getTime()
    });

 /*  const bmb = new BlockMessageBuilder();
  bmb.addSection({
    text: `:sparkles:  *Test:  \`${JSON.stringify(req.body)}\`*`
  });
  bmb.addDivider();
  await sendMessage({
    channel: process.env.DEV_CHAT_CHANNELID, 
    blocks: bmb.build(),
    text: `Test!`
  }) */
  
  res.status(200).send();
});

/* POST from explorer api. */
// eslint-disable-next-line no-unused-vars
router.post('/api/', async (req, res, next) => {
  res.status(400)
  await handleSessionCall(req, res)
});


module.exports = router;
