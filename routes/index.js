var express = require('express');
const handlePullRequestEvent = require('../webhook_handlers/github/pull_requests');
const { addReviewerToPullRequest } = require('../webhook_handlers/slack/pull_requests');
var router = express.Router();

/* POST from git. */
router.post('/', async (req, res, next) => {
  res.status(400)

  // Pass to relevant webhook handler
  if (req.body.pull_request) {
    await handlePullRequestEvent(req.body)
    res.status(200)
  }
  
  res.send();
});

/* POST from slack. */
router.post('/slack/', async (req, res, next) => {
  res.status(400)
  const data = JSON.parse(req.body.payload)

  // Pass actions to relevant webhook handler
  console.log(data);
  data.actions.forEach(action => {
    switch (action.action_id) { 

      // PULL REQUESTS
      case 'pull_request.add_reviewer': 
        addReviewerToPullRequest(action, data); 
        res.status(200);
        break;
    }
  })
  
  res.send();
});

module.exports = router;
