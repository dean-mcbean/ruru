const { WebClient } = require("@slack/web-api");
const fs = require('fs');
const axios = require('axios');

const client = new WebClient(process.env.SLACK_USER_TOKEN);

async function uploadFileToSlack(filePath, filename, channels = []) {
  try {
    // Step 1: Get an upload URL
    const filename = 'testname' + Math.random().toString(36).substring(7);
    const getUploadUrlResponse = await client.files.getUploadURLExternal({
      filename,
      length: fs.statSync(filePath).size
    });

    const { upload_url, file_id } = getUploadUrlResponse;

    // Step 2: Upload the file
    const fileData = fs.readFileSync(filePath);
    await axios.put(upload_url, fileData, {
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });

    // Step 3: Complete the upload
    const response = await client.files.completeUploadExternal({
      files: [
        {
          id: file_id,
          title: filename,
        },
      ],
      channel_id: process.env.DEV_CHAT_CHANNELID
    });

    console.log(response, 'response', {
      files: [
        {
          id: file_id,
          title: filename,
        },
      ],
      channel_id: process.env.DEV_CHAT_CHANNELID
    })

    // Step 4: Share in channels
    const fileInfo = await client.files.sharedPublicURL({
      file: file_id
    });

    console.log('fileInfo', fileInfo)

    console.log(`File "${filename}" uploaded successfully!`);
    return fileInfo.files[0];
  } catch (error) {
    console.error('Error uploading file:', error);
  }
  return null
}

module.exports = uploadFileToSlack
