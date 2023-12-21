const storage = require('node-persist');
const updateMessage = require('../../slack_usecases/update_message');

// This is a bit of a mess. Sorry for the regex!
const addReviewerToPullRequest = async (action, data) => {
    const pull_request_id = action.value;

    // Get persistent message
    await storage.init({ dir: './storage/pull_requests' });

    const prStatuses = await storage.getItem('pr_status');
    const pr_status = prStatuses[pull_request_id];


    // Get message info
    const channel_id = data.container.channel_id;
    const message_ts = data.container.message_ts;

    // Update status emoji (the regex subs the eyes into the title)
    pr_status.status_emoji = ':eyes:';
    pr_status.message_blocks[0].text.text = pr_status.message_blocks[0].text.text.replace(/\|:([^:]+):/g, `|:eyes:`);

    // Update the recent action summary
    const split_context = pr_status.message_blocks[1].elements[0].text.split('|');
    pr_status.action_summary = `Under Review by ${data.user.name}`;
    split_context[2] = '  ' + pr_status.action_summary + '  ';
    pr_status.message_blocks[1].elements[0].text = split_context.join('|');

    // Update message in slack
    const result = await updateMessage({
        channel: channel_id,
        ts: message_ts,
        blocks: pr_status.message_blocks
    })

    // Save new message
    prStatuses[pull_request_id] = pr_status;
    await storage.setItem('pr_status', prStatuses)
}




module.exports = { addReviewerToPullRequest }