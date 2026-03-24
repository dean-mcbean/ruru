const getProjects = require("../../../fetch/basecamp/get_projects.js");

const getBasecampProjects = async (req, res) => {
  const result = await getProjects(req.basecampToken);
  res.send(result);
};

module.exports = getBasecampProjects;
