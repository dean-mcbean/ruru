const { WebClient } = require("@slack/web-api");

const client = new WebClient(process.env.BOT_TOKEN);

const sendMessage = async ( message_arguments ) => {
    try {
        // Call the chat.postMessage method using the WebClient
        const result = await client.chat.postMessage({
            text: "Placeholder text (Contact Dean if you see this)",
            mrkdwn: true,
            ...message_arguments
        });

        return result;
    }
    catch (error) {
        console.error(error);
    }
}

module.exports = sendMessage
