// ============================================
// FILE: src/services/taskService.js
// ============================================
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/tasks';

axios.defaults.withCredentials = true;

export const getAllTasks = async () => {
  const response = await axios.get(API_URL);
  console.log("All Tasks: ",response);
  
  return response.data;
};

export const getTasksByProject = async (projectId) => {
  const response = await axios.get(`${API_URL}/project/${projectId}`);
  return response.data;
};

export const getTasksByUser = async (userId) => {
  const response = await axios.get(`${API_URL}/user/${userId}`);
  return response.data;
};

export const getTasksByStatus = async (status) => {
  const response = await axios.get(`${API_URL}/status/${status}`);
  return response.data;
};

export const getTaskById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await axios.post(API_URL, taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await axios.put(`${API_URL}/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};