
const { createProject } = require("../../../dispatch/basecamp/create_project.js");
const createBasecampProject = async (req, res) => {
  const { name, description, template, subscribers } = req.body;
  const result = await createProject(req.basecampToken, { name, description, template, subscribers });
  // Only send serializable data
  res.json(result && result.data ? result.data : result);
}

module.exports = {
  createBasecampProject
};
