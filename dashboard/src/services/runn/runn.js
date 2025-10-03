import authAxios from '../axios';

export const getRunnProjects = () => {
  return authAxios.get(`${process.env.VUE_APP_BASE_API_URL}/runn-projects`);
};