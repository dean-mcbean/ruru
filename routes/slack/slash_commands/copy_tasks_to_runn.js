const getProject = require('../../../fetch/basecamp/get_project');
const getTodoLists = require('../../../fetch/basecamp/get_todo_lists');
const getProjectPhases = require('../../../fetch/runn/get_project_phases');


const copyTasksToRunn = async (req, res) => {
  const parameters = req.body.text.trim().split(' ');
  if (parameters.length < 2 || parameters.length > 2) {
    res.status(400).send('Usage: /copytaskstorunn [project_id] [task_list_id]');
    return;
  }
  res.sendStatus(200); // Acknowledge the command immediately
  const basecampProjectId = parameters[0];
  const runnProjectId = parameters[1];

  // Fetch the Basecamp project
  let project;
  try {
    project = await getProject(req.basecampToken, basecampProjectId);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).send('Error fetching Basecamp project. Please check the project ID and try again.');
    return;
  }
  const todoSet = project.dock.find(item => item.name === 'todoset' && item.enabled);

  if (!todoSet) {
    res.status(404).send('Todo set not found in Basecamp project.');
    return;
  }

  // Fetch todo lists within the project
  let todoLists;
  try {
    todoLists = await getTodoLists(req.basecampToken, basecampProjectId, todoSet.id);
  } catch (error) {
    console.error('Error fetching todo lists:', error);
    res.status(500).send('Error fetching todo lists from Basecamp. Please try again later.');
    return;
  }
  if (!todoLists || todoLists.length === 0) {
    res.status(404).send('No todo lists found in the specified Basecamp project.');
    return;
  }

  // Fetch Runn project phases
  let runnPhases;
  try {
    runnPhases = await getProjectPhases(runnProjectId);
  } catch (error) {
    console.error('Error fetching Runn project phases:', error);
    res.status(500).send('Error fetching Runn project phases. Please check the Runn project ID and try again.');
    return;
  }

  // Here you would add logic to copy tasks from the fetched todo lists to Runn using their API.
  // This is a placeholder for that logic.
  console.log(`Todolists`, runnPhases);
}

module.exports = copyTasksToRunn;