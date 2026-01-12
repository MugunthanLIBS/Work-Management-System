// ============================================
// FILE: src/services/projectService.js
// ============================================
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/projects';

axios.defaults.withCredentials = true;

export const getAllProjects = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getProjectsByStatus = async (status) => {
  const response = await axios.get(`${API_URL}/status/${status}`);
  return response.data;
};

export const getProjectById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createProject = async (projectData) => {
  const response = await axios.post(API_URL, projectData);
  return response.data;
};

export const updateProject = async (id, projectData) => {
  const response = await axios.put(`${API_URL}/${id}`, projectData);
  return response.data;
};

export const deleteProject = async (id) => {
console.log("Check: ",id);

  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};