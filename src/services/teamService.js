import axios from 'axios';

const API_URL = 'http://localhost:8080/api/teams';

axios.defaults.withCredentials = true;

export const getAllTeams = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getTeamById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const getTeamsByLeader = async (leaderId) => {
  const response = await axios.get(`${API_URL}/leader/${leaderId}`);
  return response.data;
};

export const createTeam = async (teamData) => {
  const response = await axios.post(API_URL, teamData);
  return response.data;
};

export const updateTeam = async (id, teamData) => {
  const response = await axios.put(`${API_URL}/${id}`, teamData);
  return response.data;
};

export const deleteTeam = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};