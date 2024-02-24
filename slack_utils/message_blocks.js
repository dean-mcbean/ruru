
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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

function createButtonBlock({text, action_id, value, url = undefined}) {
  return {
    type: 'button',
    text: {
      type: 'plain_text',
      text,
      emoji: true
    },
    action_id,
    value,
    url
  };
}

function createHeaderBlock({text}) {
  return {
    type: 'header',
    text: {
      type: 'plain_text',
      text,
      emoji: true
    }
  };
}

function createOverflowBlock({action_id, options}) {
  return {
    type: 'overflow',
    action_id,
    options
  };
}

function createActionsBlock({elements}) {
  return {
    type: 'actions',
    elements
  };
}

function createStaticSelectElement({action_id, textByValue, placeholder = 'Select an option', initial_value = undefined}) {
  const options = Object.keys(textByValue).map(value => {
    return {
      text: createPlainTextElement({text: textByValue[value]}),
      value
    };
  });
  return {
      type: 'static_select',
      action_id,
      options,
      placeholder: createPlainTextElement({text: placeholder}),
      initial_option: initial_value ? {
        text: createPlainTextElement({text: textByValue[initial_value]}),
        value: initial_value
      } : undefined
  };
}

function createPlainTextElement({text, emoji = true}) {
  return {
    type: 'plain_text',
    text,
    emoji
  };
}

function createTextInputElement({action_id, placeholder, initial_value = undefined}) {
  return {
    type: 'plain_text_input',
    action_id,
    placeholder: createPlainTextElement({text: placeholder}),
    initial_value
  };
}

function createInputBlock({label, element}) {
  return {
    type: 'input',
    label: createPlainTextElement({text: label}),
    element
  };
}

class BlockMessageBuilder {
  constructor(blocks = []) {
    this.blocks = blocks;
  }

  addSection({text, accessory = undefined}) {
    this.blocks.push(createSectionBlock({text, accessory}));
    return this;
  }

  addDivider() {
    this.blocks.push(createDividerBlock());
    return this;
  }

  addPadding({padding = 1}) {
    for (let i = 0; i < padding; i++) {
      this.blocks.push(createSectionBlock({text: ' '}));
    }
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

  addActions({elements}) {
    this.blocks.push(createActionsBlock({elements}));
    return this;
  }    

  addButton({text, action_id, value, url = undefined}) {
    this.blocks.push(createActionsBlock({
      elements: [createButtonBlock({text, action_id, value, url})]
    }));
    return this;
  }

  addHeader({text}) {
    this.blocks.push(createHeaderBlock({text}));
    return this;
  }

  addOverflow({action_id, options}) {
    this.blocks.push(createOverflowBlock({action_id, options}));
    return this;
  }

  addInput({label, element}) {
    this.blocks.push(createInputBlock({label, element}));
    return this;
  }

  addTextInput({label, action_id, placeholder, initial_value = undefined}) {
    return this.addInput({
      label,
      element: createTextInputElement({action_id, placeholder, initial_value})
    });
  }

  clear() {
    this.blocks = [];
    return this;
  }

  build() {
    return this.blocks;
  }

  copy() {
    return new BlockMessageBuilder(this.blocks.slice());
  }
}

module.exports = {
  capitalize,

  createSectionBlock,
  createDividerBlock,
  createImageBlock,
  createContextBlock,
  createButtonBlock,
  createHeaderBlock,
  createActionsBlock,
  createOverflowBlock,

  createStaticSelectElement,
  createPlainTextElement,
  createTextInputElement,

  BlockMessageBuilder
};