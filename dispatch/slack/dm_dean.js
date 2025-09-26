const { WebClient } = require("@slack/web-api");

const client = new WebClient(process.env.BOT_TOKEN);

const sendDeanMessage = async ( message_content ) => {
    try {
        // Call the chat.postMessage method using the WebClient
        const result = await client.chat.postMessage({
            text: message_content ?? "Placeholder text",
            channel: process.env.DEAN_SLACK_USER_ID,
        });

        return result;
    }
    catch (error) {
        console.error(error);
    }
}

module.exports = sendDeanMessage