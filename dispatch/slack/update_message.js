const { WebClient } = require("@slack/web-api");

const client = new WebClient(process.env.BOT_TOKEN);

const updateMessage = async (message_arguments) => {
  try {
    // Call the chat.postMessage method using the WebClient
    const result = await client.chat.update({
      mrkdwn: true,
      ...message_arguments,
      text:
        message_arguments.text ??
        ((message_arguments.markdown_text || message_arguments.blocks)
          ? undefined
          : "(no text: pass `text`, `markdown_text`, or `blocks`)"),
    });

    return result;
  } catch (error) {
    console.error(error);
  }
};

module.exports = updateMessage;
