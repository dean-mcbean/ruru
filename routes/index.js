var express = require('express');
const handlePullRequestEvent = require('../webhook_handlers/github/pull_requests');
var router = express.Router();

/* POST from git. */
router.post('/', async (req, res, next) => {

  // Pass to relevant webhook handler
  if (req.body.pull_request) {
    await handlePullRequestEvent(req.body)
  }
  
  res.status(200).send('OK');
});

module.exports = router;
