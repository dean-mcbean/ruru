const { MongoClient } = require("mongodb");
const { WebClient } = require("@slack/web-api");
const axios = require("axios");
const { BASECAMP, URLS } = require("../../constants");

const MONGO_URI =
  process.env.MONGO_CONNECTION_STRING || "mongodb://localhost:27017";
const DB_NAME = "ruru-cache";
const CACHE_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

class MongoManager {
  constructor(request) {
    this.mongoClient = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
    this.slackClient = new WebClient(process.env.BOT_TOKEN);
    this.motionClient = axios.create({
      baseURL: URLS.motionApi,
      headers: {
        "X-API-Key": `${process.env.MOTION_KEY}`,
        "Content-Type": "application/json",
      },
    });
    this.basecampClient = axios.create({
      baseURL: `https://3.basecampapi.com/${BASECAMP.ACCOUNT_ID}`,
      headers: {
        Authorization: `Bearer ${request && request.basecampToken}`,
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent": BASECAMP.USER_AGENT,
      },
    });
    this.db = null;
    this._initPromise = this._init();
  }

  async _init() {
    await this.mongoClient.connect();
    this.db = this.mongoClient.db(DB_NAME);

    // Ensure the 'users' collection exists and create it if not
    const collections = await this.db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);
    if (!collectionNames.includes("users")) {
      await this.db.createCollection("users");
    }
  }

  static getInstance() {
    if (!MongoManager.instance) {
      MongoManager.instance = new MongoManager();
    }
    return MongoManager.instance;
  }

  async getUsers() {
    return this._getCachedResponse("users", "all", async () => {
      const result = await this.slackClient.users.list();
      return result.members;
    });
  }

  async _getCachedResponse(endpoint, key, fetchFn) {
    await this._initPromise;
    const cacheKey = `${endpoint}:${key}`;
    const now = Date.now();

    // Ensure the collection exists for the endpoint
    if (!this.db.collection(endpoint)) {
      await this.db.createCollection(endpoint);
    }
    const collection = this.db.collection(endpoint);

    let cached = await collection.findOne({ key: cacheKey });

    if (cached) {
      // If cache is older than TTL, refetch in background
      if (now - cached.updatedAt > CACHE_TTL_MS) {
        this._refetchAndUpdate(endpoint, key, fetchFn, cacheKey);
      }
      return cached.value;
    } else {
      // No cache, fetch and store
      const value = await fetchFn();
      await collection.updateOne(
        { key: cacheKey },
        { $set: { value, updatedAt: now } },
        { upsert: true },
      );
      return value;
    }
  }

  async _refetchAndUpdate(endpoint, key, fetchFn, cacheKey) {
    try {
      // Ensure the collection exists for the endpoint
      if (!this.db.collection(endpoint)) {
        await this.db.createCollection(endpoint);
      }
      const collection = this.db.collection(endpoint);

      const value = await fetchFn();
      await collection.updateOne(
        { key: cacheKey },
        { $set: { value, updatedAt: Date.now() } },
        { upsert: true },
      );
    } catch (err) {
      // Log error but don't throw
      console.error(`Failed to refetch cache for ${endpoint}:${key}`, err);
    }
  }

  async clearCache(endpoint, key) {
    await this._initPromise;
    const cacheKey = `${endpoint}:${key}`;
    // Ensure the collection exists for the endpoint
    if (!this.db.collection(endpoint)) {
      await this.db.createCollection(endpoint);
    }
    const collection = this.db.collection(endpoint);
    await collection.deleteOne({ key: cacheKey });
  }
}

module.exports = MongoManager.getInstance();
