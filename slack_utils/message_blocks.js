
function createSectionBlock({text, accessory = undefined}) {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text
    },
    accessory
  };
}

function createDividerBlock() {
  return {
    type: 'divider'
  };
}

function createImageBlock({imageUrl, altText}) {
  return {
    type: 'image',
    image_url: imageUrl,
    alt_text: altText
  };
}

function createContextBlock({text}) {
  return {
    type: 'context',
    elements: [{
      type: 'mrkdwn',
      text
    }]
  };
}

function createButtonBlock({text, actionId, value, url = undefined}) {
  return {
    type: 'button',
    text: {
      type: 'plain_text',
      text,
      emoji: true
    },
    action_id: actionId,
    value,
    url
  };
}

class BlockMessageBuilder {
  constructor() {
    this.blocks = [];
  }

  addSection({text, accessory = undefined}) {
    this.blocks.push(createSectionBlock({text, accessory}));
    return this;
  }

  addDivider() {
    this.blocks.push(createDividerBlock());
    return this;
  }

  addImage({imageUrl, altText}) {
    this.blocks.push(createImageBlock({imageUrl, altText}));
    return this;
  }

  addContext({text}) {
    this.blocks.push(createContextBlock({text}));
    return this;
  }

  addButton({text, actionId, value, url = undefined}) {
    this.blocks.push(createButtonBlock({text, actionId, value, url}));
    return this;
  }

  clear() {
    this.blocks = [];
    return this;
  }

  build() {
    return this.blocks;
  }
}

module.exports = {
  createSectionBlock,
  createDividerBlock,
  createImageBlock,
  createContextBlock,
  createButtonBlock,
  BlockMessageBuilder
};