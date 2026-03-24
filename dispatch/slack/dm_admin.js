const { WebClient } = require("@slack/web-api");

const client = new WebClient(process.env.BOT_TOKEN);

/**
 * DM or message a designated ops/admin Slack user (incidents, token refresh failures, etc.).
 * Set ADMIN_SLACK_USER_ID (Slack user ID, e.g. Uxxxx). `DEAN_SLACK_USER_ID` is accepted as a legacy alias.
 */
const sendAdminSlackMessage = async (message_content) => {
  const channel =
    process.env.ADMIN_SLACK_USER_ID || process.env.DEAN_SLACK_USER_ID;
  if (!channel) {
    console.warn(
      "[dm_admin] ADMIN_SLACK_USER_ID not set; skipping Slack notification",
    );
    return null;
  }
  try {
    const result = await client.chat.postMessage({
      text: message_content ?? "Notification",
      channel,
    });
    return result;
  } catch (error) {
    console.error(error);
  }
};

module.exports = sendAdminSlackMessage;
