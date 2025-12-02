const axios = require('axios');
const { createTodo } = require('./create_todo.js');
const { BASECAMP } = require('../../constants');

/**
 * Generic function to create a todolist in Basecamp.
 */
async function createTodolist(basecampToken, { bucketId, todolistSetId, name, description, todos }) {
  const url = `https://3.basecampapi.com/${BASECAMP.ACCOUNT_ID}/buckets/${bucketId}/todosets/${todolistSetId}/todolists.json`;
  const data = {
    name: `${name}`,
    description: `${description}`
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${basecampToken}`,
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'Ruru (dean.walker@urbanintelligence.com)'
      }
    });

    if (response.data?.id !== undefined && todos && todos.length > 0) {
      try {
        const promises = todos.map(todo => createTodo(basecampToken, {
          bucketId,
          todolistId: response.data.id,
          content: todo.content,
          startDate: todo.startDate,
          endDate: todo.endDate
        }));
        await Promise.all(promises);
      } catch (error) {
        console.error('Error creating todos for todolist:', error);
        throw error;
      }
    }
    return response.data;
  } catch (error) {
    console.error('Error creating todolist:', error);
    throw error;
  }
}

module.exports = {
  createTodolist
};