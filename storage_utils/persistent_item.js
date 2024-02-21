const NodePersist = require("node-persist");

/**
 * Represents a persistent item that can be stored and retrieved using NodePersist.
 */
class PersistentItem {
  /**
   * Creates a new PersistentItem instance.
   * @param {any} item - The item to be stored.
   * @param {string} key - The key used to identify the item in storage.
   * @param {string|null} secondary_key - The optional secondary key used to access nested properties of the item.
   */
  constructor(item, key, secondary_key = null) {
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
    let keys = params.slice(0, -1);

    if (this.secondary_key) {
      let current = this.item[this.secondary_key];
      for (let key of keys) {
        current = current[key];
      }
      current = newItem;
    } else {
      let current = this.item;
      for (let key of keys) {
        current = current[key];
      }
      current = newItem;
    }
    await this.save();
  }

  /**
   * Saves the persistent item using NodePersist.
   * @returns {Promise<void>} A promise that resolves when the item is successfully saved.
   */
  async save() {
    await NodePersist.setItem(this.key, this.item);
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
}

/**
 * Retrieves a persistent item from storage and returns a PersistentItem instance.
 * @param {string} key - The key used to identify the item in storage.
 * @param {string|null} secondary_key - The optional secondary key used to access nested properties of the item.
 * @returns {Promise<PersistentItem>} A promise that resolves with a PersistentItem instance.
 */
async function usePersistentItem(key, secondary_key = null) {
  const item = await NodePersist.getItem(key);
  return new PersistentItem(item, key, secondary_key);
}

module.exports = {
  usePersistentItem
};