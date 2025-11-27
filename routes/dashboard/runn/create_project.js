
const { createProject } = require("../../../dispatch/runn/project.js");

const createRunnProject = async (req, res) => {
  const {name, budget, managerIds, client} = req.body;
  await createProject(name, budget, managerIds, client).then((result) => {
    res.send(result);
  }).catch((error) => {
    console.error("Error in createProject:", error.response);
    res.status(error.status || 500).send(error.response?.data || "Internal server error");
  });
}

module.exports = createRunnProject;
