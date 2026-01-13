// src/services/leaveService.js - Enhanced for multi-level approval
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/leave';

// Create leave request
export const createLeaveRequest = async (userId, leaveData) => {
  try {
    const response = await axios.post(`${API_URL}/request?userId=${userId}`, leaveData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create leave request';
  }
};

// Get my leave requests
export const getMyLeaveRequests = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/my-requests?userId=${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch leave requests';
  }
};

// TL specific APIs
export const getPendingTLRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/pending-tl`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch pending TL requests';
  }
};

export const getTLRelatedRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/tl-requests`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch TL requests';
  }
};

export const tlApproveLeave = async (requestId, tlId, comments = '') => {
  try {
    const response = await axios.post(
      `${API_URL}/tl-approve/${requestId}?tlId=${tlId}`,
      { comments }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to approve leave';
  }
};

export const tlRejectLeave = async (requestId, tlId, comments) => {
  try {
    const response = await axios.post(
      `${API_URL}/tl-reject/${requestId}?tlId=${tlId}`,
      { comments }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to reject leave';
  }
};

// Manager specific APIs
export const getPendingManagerRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/pending-manager`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch pending manager requests';
  }
};

export const getAllLeaveRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch all requests';
  }
};

export const managerApproveLeave = async (requestId, managerId, comments = '') => {
  try {
    const response = await axios.post(
      `${API_URL}/manager-approve/${requestId}?managerId=${managerId}`,
      { comments }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to approve leave';
  }
};

export const managerRejectLeave = async (requestId, managerId, comments) => {
  try {
    const response = await axios.post(
      `${API_URL}/manager-reject/${requestId}?managerId=${managerId}`,
      { comments }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to reject leave';
  }
};

// Cancel leave request
export const cancelLeaveRequest = async (requestId, userId) => {
  try {
    const response = await axios.post(
      `${API_URL}/cancel/${requestId}?userId=${userId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to cancel leave';
  }
};

// Get leave balance
export const getLeaveBalance = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/balance?userId=${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch leave balance';
  }
};