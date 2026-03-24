const { getUserByEmail } = require("../../../fetch/slack/get_user.js");
const sendMessage = require("../../../dispatch/slack/send_message.js");
const { APP } = require("../../../constants");

async function sendSlackCode(slackId, code) {
  await sendMessage({
    channel: slackId,
    text: `Your Ruru dashboard verification code is: ${code}`,
  });
}

const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const signup = (codeCache) => async (req, res) => {
  const { email } = req.body;
  const domain = APP.ALLOWED_EMAIL_DOMAIN.startsWith("@")
    ? APP.ALLOWED_EMAIL_DOMAIN
    : `@${APP.ALLOWED_EMAIL_DOMAIN}`;
  if (!email.endsWith(domain)) return res.status(403).send("Invalid domain");

  const slackUser = await getUserByEmail(email);
  console.log("slackUser", slackUser);
  if (!slackUser) return res.status(404).send("Slack user not found");

  const code = generateCode();
  codeCache.set(email, code);
  await sendSlackCode(slackUser.id, code);

  res.send({ message: "Verification code sent via Slack" });
};

module.exports = signup;
