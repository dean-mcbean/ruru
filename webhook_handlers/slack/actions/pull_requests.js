const updateMessage = require('../../../slack_dispatch/update_message');
const { usePersistentItem } = require('../../../storage_utils/persistent_item');

// This is a bit of a mess. Sorry for the regex!
const addReviewerToPullRequest = async (action, data) => {
    const pull_request_id = action.value;

    // Get persistent message
    const pr_status = await usePersistentItem('pull_requests', 'pr_status', pull_request_id);
    const pr_status_value = await pr_status.get();
    
    // Get message info
    const channel_id = data.container.channel_id;
    const message_ts = data.container.message_ts;

    // Update status emoji (the regex subs the eyes into the title)
    pr_status_value.status_emoji = ':eyes:';
    pr_status_value.message_blocks[0].text.text = pr_status_value.message_blocks[0].text.text.replace(/\|:([^:]+):/g, `|:eyes:`);

    // Update the recent action summary
    const split_context = pr_status_value.message_blocks[1].elements[0].text.split('|');
    pr_status_value.action_summary = `Under Review by ${data.user.name}`;
    pr_status_value.message_blocks[1].elements[0].text = split_context[0] + '|' + split_context[1] + `|  Under Review by ${data.user.name}  |` + split_context[2];
    
    await pr_status.set(pr_status_value);

    // Update message in slack
    await updateMessage({
        channel: channel_id,
        ts: message_ts,
        blocks: pr_status_value.message_blocks,
        text: `Under Review by ${data.user.name}`
    })
}




module.exports = { addReviewerToPullRequest }