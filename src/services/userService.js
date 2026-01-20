import axios from 'axios';

const API_URL = 'http://82.29.161.163:8080/api/users';
// const API_URL = 'http://localhost:8080/api/users';

axios.defaults.withCredentials = true;

export const getAllUsers = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getUsersByRole = async (role) => {
  const response = await axios.get(`${API_URL}/role/${role}`);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axios.post(API_URL, userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await axios.put(`${API_URL}/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};