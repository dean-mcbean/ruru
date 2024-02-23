const NodePersist = require("node-persist");

const folderListeners = {};

let isSaving = false;

/**
 * Represents a persistent item that can be stored and retrieved using NodePersist.
 */
class PersistentItem {
  /**
   * Creates a new PersistentItem instance.
   * @param {string} folder - The folder used to store the item.
   * @param {any} item - The item to be stored.
   * @param {string} key - The key used to identify the item in storage.
   * @param {string|null} secondary_key - The optional secondary key used to access nested properties of the item.
   */
  constructor(folder, item, key, secondary_key = null) {
    this.folder = folder;
    this.item = item;
    this.key = key;
    this.secondary_key = secondary_key;
  }

  /**
   * Gets the value of the persistent item.
   * If a secondary key is provided, it returns the value of the nested property specified by the secondary key.
   * @returns {any} The value of the persistent item.
   */
  get value() {
    if (this.secondary_key) {
      return this.item[this.secondary_key];
    }
    return this.item;
  }

  /**
   * Sets the value of the persistent item.
   * If a secondary key is provided, it sets the value of the nested property specified by the secondary key.
   * @param {...string} params - The keys to access the nested property (if applicable) and the new value to be set.
   * @returns {Promise<void>} A promise that resolves when the item is successfully saved.
   */
  async set(...params) {
    let newItem = params[params.length - 1];

    if (params.length === 1) {
      if (this.secondary_key) {
        this.item[this.secondary_key] = newItem;
      } else {
        this.item = newItem;
      }

    } else {
      let keys = params.slice(0, -1);

      let current = this.item;
      if (this.secondary_key) {
        current = this.item[this.secondary_key];
      }

      for (let key of keys.slice(0, -1)) {
        if (current[key] === undefined) {
          current[key] = {};
        }
        current = current[key];
      }
      current[keys[keys.length - 1]] = newItem;

    }
    await this.save();
  }

  /**
   * Saves the persistent item using NodePersist.
   * @returns {Promise<void>} A promise that resolves when the item is successfully saved.
   */
  async save() {
    if (isSaving) {
      // If already saving, wait for the previous save operation to complete
      await new Promise(resolve => {
        const interval = setInterval(() => {
          if (!isSaving) {
            clearInterval(interval);
            resolve();
          }
        }, 10);
      });
    }

    isSaving = true; // Acquire the lock

    try {
      await NodePersist.init({ dir: `./storage/${this.folder}` });
      console.log(this.key, this.item);
      await NodePersist.setItem(this.key, JSON.stringify(this.item));

      // Run Listeners
      if (folderListeners[this.folder]) {
        for (let listener of folderListeners[this.folder]) {
          listener();
        }
      }
    } finally {
      isSaving = false; // Release the lock
    }
  }

  /**
   * Applies a function to modify the value of the persistent item.
   * If a secondary key is provided, it applies the function to the nested property specified by the secondary key.
   * @param {function} applyfunc - The function to apply to the value of the persistent item.
   * @returns {Promise<void>} A promise that resolves when the item is successfully saved.
   */
  async apply(applyfunc) {
    if (this.secondary_key) {
      this.item[this.secondary_key] = applyfunc(this.item[this.secondary_key]);
    } else {
      this.item = applyfunc(this.item);
    }
    await this.save();
  }

  get hasData() {
    return this.item !== undefined && this.item !== null && Object.keys(this.item).length > 0;
  }
}

/**
 * Retrieves a persistent item from storage and returns a PersistentItem instance.
 * @param {string} key - The key used to identify the item in storage.
 * @param {string|null} secondary_key - The optional secondary key used to access nested properties of the item.
 * @returns {Promise<PersistentItem>} A promise that resolves with a PersistentItem instance.
 */
async function usePersistentItem(folder, key, secondary_key = null) {
  await NodePersist.init({ dir: `./storage/${folder}` });
  console.log(folder, key, secondary_key)
  let item = await NodePersist.getItem(key);
  if (item === null || item === undefined) { 
    await NodePersist.setItem(key, JSON.stringify({}));
    item = {};
  } else {
    item = JSON.parse(item);
  }
  if (!(secondary_key === null || secondary_key === undefined) && item[secondary_key] === undefined) {
    await NodePersist.setItem(key, JSON.stringify({ [secondary_key]: {} }));
    item = { [secondary_key]: {} };
  }
  return new PersistentItem(folder, item, key, secondary_key);
}

function createStorageListener(folder, listener) {
  if (!folderListeners[folder]) {
    folderListeners[folder] = [];
  }
  folderListeners[folder].push(listener);
}

module.exports = {
  usePersistentItem,
  createStorageListener
};