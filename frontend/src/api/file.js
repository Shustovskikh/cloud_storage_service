import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      return Promise.reject({ 
        message: 'Authentication required', 
        redirectToLogin: true 
      });
    }
    return Promise.reject(error);
  }
);

export const uploadFile = async (file, name, comment = 'No comment') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name || file.name);
  formData.append('comment', comment);

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
      redirectToLogin: error.response?.status === 401 
    };
  }
};

export const listFiles = async () => {
  try {
    const response = await axiosInstance.get('/files/');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Fetch files error:', error);
    return { 
      success: false, 
      message: error.response?.data?.detail || 'Failed to fetch files',
      redirectToLogin: error.response?.status === 401 
    };
  }
};

export const listAdminFiles = async () => {
  try {
    const response = await axiosInstance.get('/files/admin/');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Fetch admin files error:', error);
    return { 
      success: false, 
      message: error.response?.data?.detail || 'Failed to fetch admin files',
      redirectToLogin: error.response?.status === 401 
    };
  }
};

export const deleteFile = async (fileId) => {
  try {
    await axiosInstance.delete(`/files/${fileId}/`);
    return { success: true };
  } catch (error) {
    console.error('Delete file error:', error);
    return { 
      success: false, 
      message: error.response?.data?.detail || 'Failed to delete file',
      redirectToLogin: error.response?.status === 401 
    };
  }
};

export const getFileUrl = (fileId) => {
  return `${API_URL}/files/${fileId}/view/`;
};

export const getDownloadLink = async (fileId) => {
  try {
    const response = await axiosInstance.get(`/files/${fileId}/share/`);
    return { 
      success: true, 
      shared_link: response.data.shared_link || getFileUrl(fileId) 
    };
  } catch (error) {
    console.error('Get shared link error:', error);
    return {
      success: false,
      message: error.response?.data?.detail || 'Failed to get shared link',
      redirectToLogin: error.response?.status === 401
    };
  }
};

export const downloadFile = async (fileId) => {
  try {
    const response = await axiosInstance.get(`/files/${fileId}/download/`, {
      responseType: 'blob'
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Download file error:', error);
    return {
      success: false,
      message: error.response?.data?.detail || 'Failed to download file',
      redirectToLogin: error.response?.status === 401
    };
  }
};

export const fetchAllUsers = async () => {
  try {
    const response = await axiosInstance.get('/users/');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Fetch users error:', error);
    return { 
      success: false, 
      message: error.response?.data?.detail || 'Failed to fetch users',
      redirectToLogin: error.response?.status === 401
    };
  }
};

export const deleteUser = async (userId) => {
  try {
    await axiosInstance.delete(`/users/${userId}/`);
    return { success: true };
  } catch (error) {
    console.error('Delete user error:', error);
    return { 
      success: false, 
      message: error.response?.data?.detail || 'Failed to delete user',
      redirectToLogin: error.response?.status === 401
    };
  }
};

export const updateFile = async (fileId, name, comment) => {
  try {
    const response = await axiosInstance.patch(`/files/${fileId}/`, { 
      name, 
      comment 
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Update file error:', error);
    return { 
      success: false, 
      message: error.response?.data?.detail || 'Failed to update file',
      redirectToLogin: error.response?.status === 401
    };
  }
};

export const fetchFile = async (fileId) => {
  try {
    const response = await axiosInstance.get(`/files/${fileId}/`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Fetch file error:', error);
    return { 
      success: false, 
      message: error.response?.data?.detail || 'Failed to fetch file data',
      redirectToLogin: error.response?.status === 401
    };
  }
};

export default axiosInstance;