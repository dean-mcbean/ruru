// Updates the homepage of this app for a specific user
const { WebClient } = require("@slack/web-api");

const client = new WebClient(process.env.BOT_TOKEN);

const updateHome = async ({user_id, blocks}) => {
    try {
        // Call the chat.postMessage method using the WebClient
        const result = await client.views.publish({
          user_id,
          view: {
            type: 'home',
            blocks
          }
        })

        return result;
    }
    catch (error) {
        console.error(error);
    }
}

module.exports = updateHome
