
const getProjects = require("../../../fetch/runn/get_projects.js");
const getProjectPhases = require("../../../fetch/runn/get_project_phases.js");

const getRunnProjects = async (req, res) => {
  const [projects, phases] = await Promise.all([
    getProjects(),
    getProjectPhases()
  ]);
  console.log(projects, phases)
  if (!projects) {
    return res.status(404).send("No projects found");
  }
  const resultWithPhases = projects.map(project => {
    return {
      ...project,
      phases: phases.filter(phase => phase.projectId === project.id)
    };
  });
  res.send(resultWithPhases);
}

module.exports = getRunnProjects;
