import authAxios from '../axios';

export const getRunnProjects = () => {
  return authAxios.get(`${process.env.VUE_APP_BASE_API_URL}/runn-projects`);
};

export const getRunnClients = () => {
  return authAxios.get(`${process.env.VUE_APP_BASE_API_URL}/runn/clients`);
};

export const createRunnProject = (name, budget, managerIds, client) => {
  return authAxios.post(`${process.env.VUE_APP_BASE_API_URL}/runn/projects`, {
    name, budget, managerIds, client
  });
};