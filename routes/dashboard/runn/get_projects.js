
const getProjects = require("../../../fetch/runn/get_projects.js");
const getProjectPhases = require("../../../fetch/runn/get_project_phases.js");

const getRunnProjects = async (req, res) => {
  const result = await getProjects();
  if (!result) {
    return res.status(404).send("No projects found");
  }
  const resultWithPhases = [];
  for (const project of result) {
    const phases = await getProjectPhases(project.id);
    resultWithPhases.push({ ...project, phases });
  }
  res.send(resultWithPhases);
}

module.exports = getRunnProjects;
