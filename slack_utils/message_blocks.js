
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

function createTextInputElement({action_id, placeholder, initial_value = undefined, triggerOn = undefined}) {

  const dispatchActionConfig = triggerOn ? {
    trigger_actions_on: triggerOn
  } : undefined;

  // options for triggerOn: ['on_enter_pressed', 'on_character_entered']

  return {
    type: 'plain_text_input',
    action_id,
    placeholder: createPlainTextElement({text: placeholder}),
    initial_value,
    dispatch_action_config: dispatchActionConfig,
  };
}

function createInputBlock({label, element}) {
  return {
    type: 'input',
    label: createPlainTextElement({text: label}),
    element,
    dispatch_action: true,
  };
}

function createDropdownElement({action_id, options, initial_option = undefined, placeholder = 'Select an option'}) {
  return {
    type: 'static_select',
    action_id,
    options: options.map(option => {
      return {
        text: createPlainTextElement({text: option.text}),
        value: option.value,
      };
    }),
    initial_option,
    placeholder: createPlainTextElement({text: placeholder}),
  };
}

function createCheckboxListElement({action_id, options, initial_options = undefined}) {
  return {
    type: 'checkboxes',
    action_id,
    options: options.map(option => {
      return {
        text: createPlainTextElement({text: option.text}),
        value: option.value,
        description: option.description ? createPlainTextElement({text: option.description}) : undefined,
      };
    }),
    initial_options: initial_options ? initial_options.map(option => {
      return {
        text: createPlainTextElement({text: option.text}),
        value: option.value,
        description: option.description ? createPlainTextElement({text: option.description}) : undefined,
      };
    }) : undefined,
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

  addTextInput({label, action_id, placeholder, initial_value = undefined, triggerOn = undefined}) {
    return this.addInput({
      label,
      element: createTextInputElement({action_id, placeholder, initial_value, triggerOn}),
    });
  }

  addDropdown({label, action_id, options, initial_option = undefined, placeholder = 'Select an option'}) {
    return this.addInput({
      label,
      element: createDropdownElement({action_id, options, initial_option, placeholder}),
    });
  }

  addCheckboxList({label, action_id, options, initial_options = undefined}) {
    return this.addInput({
      label,
      element: createCheckboxListElement({action_id, options, initial_options}),
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