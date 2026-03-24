const { CollectionInterface } = require("./core");

class Users extends CollectionInterface {
  static instance = null;
  _collection_name = "users";

  constructor() {
    super();
    if (Users.instance) {
      return Users.instance;
    }
    this._client = null;
    this._collection = null;
    Users.instance = this;
  }
}

module.exports = new Users();
