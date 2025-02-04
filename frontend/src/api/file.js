import axios from 'axios';
import { getAuthHeader, setToken, removeTokens } from '../utils/helpers';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const authHeader = getAuthHeader();
    if (authHeader) {
      config.headers = { ...config.headers, ...authHeader };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        removeTokens();
        return Promise.reject({ message: 'No refresh token available' });
      }

      try {
        const { data } = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });
        const { access } = data;
        setToken(access, refreshToken);

        error.config.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(error.config);
      } catch (refreshError) {
        removeTokens();
        return Promise.reject({ message: 'Token refresh failed', details: refreshError.message });
      }
    }
    return Promise.reject(error);
  }
);

export const uploadFile = async (file, name) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name || file.name);

  try {
    const response = await axiosInstance.post('/files/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      message: error.response?.data?.detail || 'File upload failed',
    };
  }
};

export const listFiles = async () => {
  try {
    const response = await axiosInstance.get('/files/');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Fetch files error:', error);
    return { success: false, message: error.response?.data?.detail || 'Failed to fetch files' };
  }
};

export const listAdminFiles = async () => {
  try {
    const response = await axiosInstance.get('/files/?user=1');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Fetch admin files error:', error);
    return { success: false, message: error.response?.data?.detail || 'Failed to fetch admin files' };
  }
};

export const deleteFile = async (fileId) => {
  try {
    await axiosInstance.delete(`/files/${fileId}/`);
    return { success: true };
  } catch (error) {
    console.error('Delete file error:', error);
    return { success: false, message: error.response?.data?.detail || 'Failed to delete file' };
  }
};

export const getDownloadLink = async (fileId) => {
  try {
    const response = await axiosInstance.get(`/files/${fileId}/get_shared_link/`);
    console.log('Download link response:', response.data);
    return { success: true, shared_link: response.data.shared_link };
  } catch (error) {
    console.error('Get shared link error:', error);
    return {
      success: false,
      message: error.response?.data?.detail || 'Failed to get shared link',
    };
  }
};

export const getUserInfo = async (userId) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}/`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get user info error:', error);
    return { success: false, message: error.response?.data?.detail || 'Failed to get user info' };
  }
};

export const fetchAllUsers = async () => {
  try {
    const response = await axiosInstance.get('/users/');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Fetch users error:', error);
    return { success: false, message: error.response?.data?.detail || 'Failed to fetch users' };
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/users/${userId}/`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, message: error.response?.data?.detail || 'Failed to delete user' };
  }
};

export const updateFile = async (fileId, fileData) => {
  try {
    const response = await axiosInstance.put(`/files/${fileId}/update/`, fileData, {
      headers: { 'Content-Type': 'application/json' },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Update file error:', error);
    return {
      success: false,
      message: error.response?.data?.detail || 'Failed to update file',
    };
  }
};
