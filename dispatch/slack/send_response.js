const axios = require("axios");

const sendToResponseUrl = async (response_url, message_arguments) => {
  try {
    // Call the chat.postMessage method using the response URL
    const result = await axios.post(response_url, {
      text: message_arguments.markdown_text
        ? undefined
        : "(no text: pass `text`, `markdown_text`, or `blocks`)",
      mrkdwn: true,
      response_type: "ephemeral",
      ...message_arguments,
    });

    return result;
  } catch (error) {
    console.error("Error sending message via response URL:", error);
    throw error;
  }
};

module.exports = sendToResponseUrl;
