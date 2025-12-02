const { createTodolist } = require("../../../dispatch/basecamp/create_todolist.js");

const createBasecampTodolist = async (req, res) => {
  const { bucketId, todolistSetId, name, description, todos } = req.body;
  const result = await createTodolist(req.basecampToken, { bucketId, todolistSetId, name, description, todos });
  // Only send serializable data
  res.json(result && result.data ? result.data : result);
};

module.exports = {
  createBasecampTodolist
};
