var express = require('express');
const { handleWorkflowRunEvent, handleWorkflowBotPushEvent, updateStageVersion, handlePlaywrightTestEvent } = require('./github/workflow_runs');
const { handleAction } = require('../utils/slack/message_blocks/action_handler');
const { handleIssuePullRequestEvent, handlePullRequestEvent } = require('./github/pull_requests');
const { handleIssueEvent } = require('./github/issues');
const { handleNewBranchEvent } = require('./github/new_branch');
const { usePersistentItem } = require("../utils/mongodb/persistent_item");
const { logBug } = require('./slack/message_action/log_bug');
const { logFeedback } = require('./slack/message_action/log_feedback');
const { logDataError } = require('./slack/message_action/log_data_error');
const { logEngineSuggestion } = require('./slack/message_action/log_engine_suggestion');
const sendToResponseUrl = require('../dispatch/slack/send_response');
const { ensureBasecampToken } = require('../middleware/basecamp');
const copyTasksToRunn = require('./slack/slash_commands/copy_tasks_to_runn');
const { recieveDealStageChange } = require('./hubspot/dealstage');

var router = express.Router();

router.get('/', function(req, res) {
  res.redirect('/dashboard');
});

router.use('/dash-api', require('./dashboard/index'));

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
router.post('/slack/copytaskstorunn', ensureBasecampToken, copyTasksToRunn);
router.post('/slack/', ensureBasecampToken, async (req, res) => {
  res.status(400)
  const data = JSON.parse(req.body.payload)
  let response;

  // Pass actions to relevant webhook handler
  if (data.type === 'message_action') {
    if (data.callback_id === 'log_bug') {
      res.sendStatus(200);
      response = await logBug(data, req.basecampToken);
    } else if (data.callback_id === 'log_feedback') {
      res.sendStatus(200);
      response = await logFeedback(data, req.basecampToken);
    } else if (data.callback_id === 'log_data_error') {
      res.sendStatus(200);
      response = await logDataError(data, req.basecampToken);
    } else if (data.callback_id === 'log_engine_suggestion') {
      res.sendStatus(200);
      response = await logEngineSuggestion(data, req.basecampToken);
    }

    if (response) {
      sendToResponseUrl(data.response_url, {
        text: `<@${data.user.id}> ${response}`,
        response_type: 'ephemeral',
      });
    }
  } else if (data.type === 'block_actions') {
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
  }
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
  
  res.status(200).send();
});

/* POST from hubspot. */
// eslint-disable-next-line no-unused-vars
router.post('/hubspot/', async (req, res, next) => {
  console.log('Received HubSpot webhook:', req.body); 
  try { 
    for (const deal of req.body) {
      // stage has become "7. Contract Negotiations"
      if (deal.propertyName == 'dealstage' && deal.propertyValue == '188541341') {
        recieveDealStageChange(deal);
      }
    }
    res.status(200).send()
  } catch (e) {
    console.log(e)
  }
});

/* POST from explorer api. */
// Used to track usage of Rex, has now been replaced by datadog
// Still kept with a 200 response for backwards compatibility
// eslint-disable-next-line no-unused-vars
router.post('/api/', async (req, res, next) => {
  res.status(200).send()
  //await handleSessionCall(req, res)
});

module.exports = router;
