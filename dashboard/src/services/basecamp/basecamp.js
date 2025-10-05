import authAxios from '../axios';

export const getBasecampProjects = () => {
  return authAxios.get(`${process.env.VUE_APP_BASE_API_URL}/basecamp-projects`);
};