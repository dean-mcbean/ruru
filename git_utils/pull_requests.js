/* eslint-disable no-unused-vars */
const uploadFileToSlack = require('../slack_dispatch/upload_file');
const { BlockMessageBuilder, createButtonBlock } = require('../slack_utils/message_blocks');
const { getUserByGithubUsername } = require('../storage_utils/get_user');
const { usePersistentItem } = require('../storage_utils/persistent_item');
const { bindAction } = require('../webhook_handlers/slack/action_handler');
const { addReviewerToPullRequest } = require('../webhook_handlers/slack/actions/pull_requests');
const axios = require('axios');
const fs = require('fs');

function sIf(num) {
    // Returns an 's' if num is greater than 1 i.e. warrants a plural
    return num > 1 ? 's' : ''
}

function generateDescription(data) {
    let description = [];
    if (data.pull_request.additions) 
        description.push(`${data.pull_request.additions} Addition${sIf(data.pull_request.additions)}`)
    if (data.pull_request.deletions)
        description.push(`${data.pull_request.deletions} Deletion${sIf(data.pull_request.deletions)}`)
    if (data.pull_request.changed_files)
        description.push(`${data.pull_request.changed_files} Changed File${sIf(data.pull_request.changed_files)}`)
    return description.join(', ')
}

async function fetchAndConvertToBase64(url) {
    try {
        const filename = url.split('/').pop();
        const fileLocation = `public/images/${filename}.png`;

        console.log('filename', fileLocation, filename)
        // if file already exists, return it
        if (fs.existsSync(filename)) {
            return filename + '.png';
        }

        console.log(`Bearer ${process.env.GITHUB_TOKEN}`)
        const response = await axios.get(url, {
            responseType: 'arraybuffer', // Ensure binary response
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, // Replace with your actual token
            },
          });
      
        const imageBuffer = Buffer.from(response.data, 'binary');
        //const base64Image = imageBuffer.toString('base64');
    
        // Save the base64 image to a file (optional)
        fs.writeFileSync(fileLocation, imageBuffer);
    
        return filename + '.png';
    } catch (error) {
      console.error('Error fetching or converting image:', error);
    }
    return '';
  }

async function getImageBlobsFromDescription(description) {
    // Extracts image URLs from a description
    let imageUrls = [];
    // Find markdown image URLs
    const sectionUrls = description.match(/!\[image\]\((https?:\/\/[^\s]+)\)/g);
    if (sectionUrls) {
        imageUrls.push(...sectionUrls.map(url => {
            return url.match(/!\[image\]\((https?:\/\/[^\s]+)\)/)[1];
        }))
    }

    // Find HTML <img> src URLs
    const htmlImgUrls = description.match(/<img[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/g);
    if (htmlImgUrls) {
        imageUrls.push(...imageUrls.concat(
            htmlImgUrls.map(tag => {
                const match = tag.match(/src=["'](https?:\/\/[^"']+)["']/);
                return match ? match[1] : null;
            }).filter(Boolean)
        ))
    }

    let images = [];
    for (const url of imageUrls) {
        const base64Image = await fetchAndConvertToBase64(url);
        images.push(base64Image);
    }

    return images;
}

async function uploadImageUrlsToServer(description) {
    const imageNames = await getImageBlobsFromDescription(description);

    return imageNames.map(x => `https://ruru.uintel.co.nz/ruru-public/3fH8zC5jQ1/images/${x}`);
}


async function uploadImageUrlsToSlack(description) {
    const images = await getImageBlobsFromDescription(description);

    // Upload image blobs to Slack
    const imageUrls = [];
    for (const image of images) {
        const imageUrl = await uploadFileToSlack(image, image.split('/').pop(), process.env.DEV_CHAT_CHANNELID);
        if (imageUrl) {
            imageUrls.push(imageUrl);
        }
    }

    return imageUrls;
}

function replaceImagesWithWords(description) {
    // Replaces image markdown with the word "image" linked to the same url
    let index = 1;
    return description.replace(/!\[image\]\((https?:\/\/[^\s]+)\)/g, (match, url) => {
        return `<${url}|🖼️ (image)>`;
    }).replace(/<img[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/g, (match, url) => {
        return `<${url}|🖼️ (image)>`;
    });
}

function replaceOtherLinksWithShorterLinks(description) {
    // Replaces other links with shorter links
    return description.replace(/\[https?:\/\/(.*?)\]\((https?:\/\/[^\s]+)\)/g, (match, text, url) => {
        return `<${url}|🔗${text.substring(0, 16)}${text.length >= 16 ? '...' : ''}>`;
    });
}



async function generateMessageContentForPullRequest(data) {
    // Fetch info on this PR's status
    const pr_url = data.pull_request.html_url.split('.');
    const persistent_pr_status = await usePersistentItem('pull_requests', 'pr_status', pr_url[pr_url.length - 1]);
    const pr_status = await persistent_pr_status.get();


    let creator = data.pull_request.user.login;
    const slack_user = await getUserByGithubUsername(creator);
    if (slack_user) {
        creator = `<@${slack_user.id}>`;
    }
    let sender = data.sender.login; // The person who did this data.action
    const slack_sender = await getUserByGithubUsername(sender);
    if (slack_sender) {
        sender = slack_sender.profile.first_name;
    }

    // Determine Status Emoji
    var status = 'Open';
    if (data.pull_request.merged_at) {
        // It's been merged!
        status = 'Merged';
    } else if (data.pull_request.state == 'closed') {
        // Closed and NOT merged
        status = 'Closed';
    }

    // Link to repo
    const repo_url = `<${data.pull_request.head.repo.html_url}|${data.pull_request.head.repo.name}>`;

    // Determine Status and Action summary
    const readable_action = data.action.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
    let status_emoji = pr_status?.status_emoji;
    let action_summary = pr_status?.action_summary; // By default, leave it at whatever it was last
    if (data.pull_request.merged_at) {
        // Because even on merging, the data.action is still "closed", so we detect it this way
        action_summary = `Merged by ${sender}`; 
        status_emoji = ':merged:';

    } else if (['closed', 'opened', 'reopened', 'review_requested', 'edited'].includes(data.action)) {
        // Just use those verbs
        action_summary = `${readable_action} by ${sender}`
        status_emoji = {
            'closed': ':x:', 
            'edited': ':pencil:', 
            'opened': ':eight_spoked_asterisk:',
            'reopened': ':eight_spoked_asterisk:',
            'review_requested': ':raising_hand:'
        }[data.action];

    } else if (data.review && data.review.state == 'approved') {
        action_summary = `Approved by ${sender}`;
        status_emoji = ':white_check_mark:';

    } else if (data.review && data.action == 'submitted') {
        // Reviewed & not approved 
        action_summary = `Changes Requested by ${sender}`;
        status_emoji = ':warning:';
    }
    // Save to persistent memory
    await persistent_pr_status.set('status_emoji', status_emoji);
    await persistent_pr_status.set('action_summary', action_summary);
    

    //Description
    var description = generateDescription(data);
    if (pr_status && pr_status.description) description = pr_status.description;
    if (data.pull_request.body) description = data.pull_request.body
    await persistent_pr_status.set('description', description); // I save this before closed on purpose, to keep the description in case it reopens
    if (data.action == 'closed') description = ''

    const imageUrls = await uploadImageUrlsToServer(description);
    await persistent_pr_status.set('image_ids', imageUrls);
    const slackImageBlocks = imageUrls.map(url => {
        return {
            imageUrl: url,
            altText: 'image'
        }
    })
    description = replaceImagesWithWords(description);
    description = replaceOtherLinksWithShorterLinks(description);

    
    await persistent_pr_status.set('title', data.pull_request.title);


    let button = undefined;
    if (data.pull_request.state != 'closed' && !(data.review && data.action == 'submitted')) {
        
        const pr_url = data.pull_request.html_url.split('.');
        button = createButtonBlock({
            text: ':eyes: Review Pull Request',
            value: `${pr_url[pr_url.length - 1]}`,
            url: data.pull_request.html_url,
            action_id: bindAction('pull_request.add_reviewer', addReviewerToPullRequest)
        })
    }

    // All Message Blocks
    const bmb = new BlockMessageBuilder()
    bmb.addSection({
        text: `<${data.pull_request.html_url}|${status_emoji}  *${data.pull_request.title}*>
${description}`,
        accessory: button
    })

    // Add image blocks
    slackImageBlocks.forEach(block => bmb.addImage(block));

    bmb.addContext({
        text: `PR by ${creator} |  *${status}*  |  ${action_summary}  |  ${repo_url}`
    })
    .addDivider()
    
    if (data.pull_request.merged_at) {
        // It's been merged!
        bmb.clear()
        .addContext({
            text: `*<${data.pull_request.html_url}|${data.pull_request.title}>*  |  *${status}*  |  ${repo_url}`
        })
    }

    // Save Presistent PR Status
    await persistent_pr_status.set('message_blocks', bmb.build());
    return bmb.build();
}


async function fetchRecentlyMergedPRs(repo) {
    // Fetches recently merged PRs
    // This is a placeholder for a future implementation
    const url = `https://api.github.com/repos/uintel/${repo}/pulls?state=closed&base=main&per_page=100`;
    const response = await axios.get(url, {
        headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
    });
    const mergedPRs = response.data.filter(pr => pr.merged_at);
    
    return mergedPRs.map(pr => ({
        title: pr.title,
        user: pr.user.login,
        merged_at: new Date(pr.merged_at),
        url: pr.html_url
    }));
}

module.exports = { generateMessageContentForPullRequest, fetchRecentlyMergedPRs }