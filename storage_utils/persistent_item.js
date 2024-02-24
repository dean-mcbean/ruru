const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
const ruruDB = client.db("ruru");

const collectionListeners = {};

/**
 * Represents a persistent item that can be stored and retrieved using MongoDB.
 */
class PersistentItem {
  /**
   * Creates a new PersistentItem instance.
   * @param {string} collection_id - The ID of the collection used to store the item.
   * @param {string} document_id - The ID of the document to be retrieved from the collection.
   */
  constructor(collection_id, document_id, keys) {
    this.collection_id = collection_id;
    this.collection = ruruDB.collection(collection_id);
    this.document_id = document_id;
    this.document = null;
    this.keys = keys;
  }

  async updateDocument() {
    try {
      this.document = await this.collection.findOne({ _id: this.document_id });
      
      if (this.document === null) {
        this.document = {};
        await this.collection.insertOne({ _id: this.document_id, ...this.document });
      }
    } catch (error) {
      console.error("Error retrieving document:", error);
    }
  }

  /**
   * Gets the value of the persistent item.
   * @returns {Promise<any>} A promise that resolves with the value of the persistent item.
   */
  async get(...params) {
    await this.updateDocument();
    let result = this.document;
    for (let key of this.keys) {
      if (result === undefined || result === null || typeof result !== 'object') {
        return undefined;
      }
      result = result[key];
    }
    for (let param of params) {
      if (result === undefined || result === null || typeof result !== 'object') {
        return undefined;
      }
      result = result[param];
    }
    return result;
  }

  /**
   * Sets the value of the persistent item.
   * @param {...string} params - The keys to access the nested property (if applicable) and the new value to be set.
   * @returns {Promise<void>} A promise that resolves when the item is successfully saved.
   */
  async set(...params) {
    console.log(params)
    const newItem = params.pop();
    const mykeys = [...this.keys];
    const keys = params.slice(0, -1);
    let lastKey = params.pop();
    if (lastKey === undefined) {
      lastKey = mykeys.pop();
    }
    console.log(mykeys, keys, lastKey, newItem)
    
    await this.updateDocument();
    let document = this.document;
    for (let key of mykeys) {
      console.log(key, document)
      if (document[key] === undefined || document[key] === null || typeof document[key] !== 'object') {
        document[key] = {};
      }
      document = document[key];
    }
    for (let key of keys) {
      console.log('a', key, document)
      if (document[key] === undefined || document[key] === null || typeof document[key] !== 'object') {
        document[key] = {};
      }
      document = document[key];
    }
    if (lastKey !== undefined) {
      document[lastKey] = newItem;
    } else {
      this.document = newItem;
    }


    await this.collection.updateOne({ _id: this.document_id }, { $set: this.document });
  
    // Run Listeners
    console.log(collectionListeners, this.collection_id, collectionListeners[this.collection_id])
    if (collectionListeners[this.collection_id]) {
      for (let listener of collectionListeners[this.collection_id]) {
        await listener();
      }
    }
  }

  /**
   * Applies a function to modify the value of the persistent item.
   * @param {function} applyfunc - The function to apply to the value of the persistent item.
   * @returns {Promise<void>} A promise that resolves when the item is successfully saved.
   */
  async apply(applyfunc) {
    let document = await this.get();
    document = applyfunc(document);
    await this.collection.updateOne({ _id: this.document_id }, { $set: document });
  }

  /**
   * Checks if the persistent item has data.
   * @returns {Promise<boolean>} A promise that resolves with a boolean indicating if the item has data.
   */
  async hasData() {
    const document = await this.get();
    return document !== undefined && document !== null && Object.keys(document).length > 0;
  }
}

/**
 * Retrieves a persistent item from storage and returns a PersistentItem instance.
 * @param {string} collection_id - The ID of the collection used to store the item.
 * @param {string} document_id - The ID of the document to be retrieved from the collection.
 * @returns {Promise<PersistentItem>} A promise that resolves with a PersistentItem instance.
 */
async function usePersistentItem(collection_id, document_id, ...keys) {
  await client.connect();
  const item = new PersistentItem(collection_id, document_id, keys);
  await item.updateDocument();
  return item;
}

/**
 * Creates a storage listener for a specific folder.
 * @param {string} folder - The folder to listen for changes.
 * @param {function} listener - The listener function to be called when changes occur.
 */
function createCollectionListener(collection_id, listener) {
  if (!collectionListeners[collection_id]) {
    collectionListeners[collection_id] = [];
  }
  collectionListeners[collection_id].push(listener);
}

module.exports = {
  usePersistentItem,
  createCollectionListener
};