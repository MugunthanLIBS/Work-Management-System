import axios from 'axios';

// const API_URL = 'http://82.29.161.163:8080/api/auth';
const API_URL = 'http://localhost:8080/api/auth';

axios.defaults.withCredentials = true;

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};

export const logout = async () => {
  const response = await axios.post(`${API_URL}/logout`);
  return response.data;
};

export const validateToken = async () => {
  const response = await axios.get(`${API_URL}/validate`);
  return response.data;
};