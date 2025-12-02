const { MongoClient } = require('mongodb');

class Document {
  constructor(collection, data) {
    this._collection = collection;
    Object.assign(this, data);
  }

  async save() {
    if (!this._id) throw new Error('Cannot save document without _id');
    // Exclude _collection from update
    const { _collection, ...data } = this;
    await _collection.updateOne(
      { _id: this._id },
      { $set: data }
    );
  }
}

class CollectionInterface {
  _client = null;
  _collection = null;
  _collection_name = null;

  async _connect() {
    if (!this._client) {
      this._client = new MongoClient(process.env.MONGO_CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      await this._client.connect();
      const db = this._client.db('ruru-2');
      this._collection = db.collection(this._collection_name);
    }
  }

  async findOne(query, options = {}) {
    await this._connect();
    const doc = await this._collection.findOne(query, options);
    if (!doc) return null;
    return new Document(this._collection, doc);
  }

  async find(query, options = {}) {
    await this._connect();
    const docs = await this._collection.find(query, options).toArray();
    return docs.map(doc => new Document(this._collection, doc));
  }

  async insertOne(doc, options = {}) {
    await this._connect();
    const result = await this._collection.insertOne(doc, options);
    return this.findOne({ _id: result.insertedId });
  }

  async updateOne(filter, update, options = {}) {
    await this._connect();
    await this._collection.updateOne(filter, update, options);
    return this.findOne(filter);
  }

  async updateMany(filter, update, options = {}) {
    await this._connect();
    return this._collection.updateMany(filter, update, options);
  }

  async deleteOne(filter, options = {}) {
    await this._connect();
    const result = await this._collection.deleteOne(filter, options);
    return result.deletedCount > 0;
  }

  async deleteMany(filter, options = {}) {
    await this._connect();
    const result = await this._collection.deleteMany(filter, options);
    return result.deletedCount > 0;
  }

  async close() {
    if (this._client) {
      await this._client.close();
      this._client = null;
      this._collection = null;
    }
  }
}

module.exports = {
  CollectionInterface
};