import axios from 'axios';
import { getAuthHeader } from '../utils/helpers';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

export const fetchCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/me/`, { headers: getAuthHeader() });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Fetch current user error:', error);
    return { success: false, message: error.response?.data || 'Failed to fetch user data' };
  }
};

export const fetchAllUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/`, { headers: getAuthHeader() });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Fetch all users error:', error);
    return { success: false, message: error.response?.data || 'Failed to fetch all users' };
  }
};

export const deleteUser = async (userId) => {
  try {
    await axios.delete(`${API_BASE_URL}/users/${userId}/`, { headers: getAuthHeader() });
    return { success: true };
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, message: error.response?.data || 'Failed to delete user' };
  }
};

export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/`, userData, { headers: getAuthHeader() });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Create user error:', error);
    return { success: false, message: error.response?.data || 'Failed to create user' };
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/${userId}/`, userData, { headers: getAuthHeader() });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Update user error:', error);
    return { success: false, message: error.response?.data || 'Failed to update user' };
  }
};
