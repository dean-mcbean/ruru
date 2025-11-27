import authAxios from '../axios';

export const getBasecampProjects = () => {
  return authAxios.get(`${process.env.VUE_APP_BASE_API_URL}/basecamp/projects`);
};

export const uploadMarkdownToBasecamp = (file, bucketId) => {
  const formData = new FormData();
  formData.append('markdown', file);
  formData.append('bucketId', bucketId);
  return authAxios.post(`${process.env.VUE_APP_BASE_API_URL}/upload-markdown`, formData);
}

export const createBasecampProject = ({name, description, template}) => {
  // Adds Chantelle as a subscriber by default
  return authAxios.post(`${process.env.VUE_APP_BASE_API_URL}/basecamp/project`, { name, description, template, subscribers: [49523550] });
};
