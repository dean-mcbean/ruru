const sendMessage = require("../../../dispatch/slack/send_message.js");
const { getUserByEmail } = require("../../../fetch/slack/get_user.js");

const notifyOnSlack = async (req, res) => {
  const { message, email } = req.body;

  const slackUser = await getUserByEmail(email);
  if (!slackUser) return res.status(404).send("Slack user not found");
  await sendMessage({
    channel: slackUser.id,
    text: message,
  });
  res.send({ message: "Notification sent via Slack" });
};

module.exports = notifyOnSlack;
