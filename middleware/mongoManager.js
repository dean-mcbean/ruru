
const mongoManager = require('../storage_utils/mongoManager');

async function attachMongoManager(req, res, next) {
  req.mongoManager = await mongoManager.getInstance();

  next();
}

module.exports = {
  attachMongoManager
};