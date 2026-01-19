const axios = require('axios');
const { BASECAMP } = require('../../constants');

/**
 * Polls the Basecamp API for project construction completion.
 * Returns the project ID once construction is completed.
 */
async function awaitProjectConstruction(basecampToken, templateId, constructionId) {
  let isCompleted = false;
  let projectId = null;

  while (!isCompleted) {
    const response = await axios.get(
      `https://3.basecampapi.com/${BASECAMP.ACCOUNT_ID}/templates/${templateId}/project_constructions/${constructionId}.json`,
      {
        headers: {
          'Authorization': `Bearer ${basecampToken}`,
          'Content-Type': 'application/json; charset=utf-8',
          'User-Agent': 'Ruru (dean.walker@urbanintelligence.com)'
        }
      }
    );
    isCompleted = response.data.status === 'completed';
    if (isCompleted && response.data.project && response.data.project.id) {
      projectId = response.data.project.id;
    } else {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return projectId;
}

/**
 * Generic function to create a project in Basecamp.
 */
async function createProject(basecampToken, { name, description, template, subscribers = [] }) {
  let newProject;
  let projectId;

  if (template) {
    // Create project construction from template
    const projectConstruction = await axios.post(
      `https://3.basecampapi.com/${BASECAMP.ACCOUNT_ID}/templates/${template}/project_constructions.json`,
      {
        project: {
          name: `${name}`,
          description: `${description}`,
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${basecampToken}`,
          'Content-Type': 'application/json; charset=utf-8',
          'User-Agent': 'Ruru (dean.walker@urbanintelligence.com)'
        }
      }
    ).catch(error => {
      console.error('Error creating project from template:', error);
      throw error;
    });
    const constructionId = projectConstruction.data.id;
    projectId = await awaitProjectConstruction(basecampToken, template, constructionId);
    // Fetch the newly created project details
    newProject = await axios.get(
      `https://3.basecampapi.com/${BASECAMP.ACCOUNT_ID}/projects/${projectId}.json`,
      {
        headers: {
          'Authorization': `Bearer ${basecampToken}`,
          'Content-Type': 'application/json; charset=utf-8',
          'User-Agent': 'Ruru (dean.walker@urbanintelligence.com)'
        }
      }
    ).catch(error => {
      console.error('Error fetching new project details:', error);
      throw error;
    });
  } else {
    // Create a blank project
    newProject = await axios.post(
      `https://3.basecampapi.com/${BASECAMP.ACCOUNT_ID}/projects.json`,
      {
        name: `${name}`,
        description: `${description}`,
      },
      {
        headers: {
          'Authorization': `Bearer ${basecampToken}`,
          'Content-Type': 'application/json; charset=utf-8',
          'User-Agent': 'Ruru (dean.walker@urbanintelligence.com)'
        }
      }
    ).catch(error => {
      console.error('Error creating project:', error);
      throw error;
    });
    projectId = newProject.data.id;
  }

  // Grant access to subscribers if provided and project id is available
  if (subscribers && subscribers.length > 0 && projectId) {
    await axios.put(
      `https://3.basecampapi.com/${BASECAMP.ACCOUNT_ID}/projects/${projectId}/people/users.json`,
      {
        grant: subscribers
      },
      {
        headers: {
          'Authorization': `Bearer ${basecampToken}`,
          'Content-Type': 'application/json; charset=utf-8',
          'User-Agent': 'Ruru (dean.walker@urbanintelligence.com)'
        }
      }
    ).catch(error => {
      console.error('Error granting project access:', error);
      throw error;
    });
  }

  if (projectId) {
    await axios.put(
      `https://3.basecampapi.com/${BASECAMP.ACCOUNT_ID}/projects/${projectId}.json`,
      {
        admissions: 'employee'
      },
      {
        headers: {
          'Authorization': `Bearer ${basecampToken}`,
          'Content-Type': 'application/json; charset=utf-8',
          'User-Agent': 'Ruru (dean.walker@urbanintelligence.com)'
        }
      }
    ).catch(error => {
      console.error('Error updating project admissions:', error);
      throw error;
    });
  }


  return newProject;
}

module.exports = {
  createProject
};