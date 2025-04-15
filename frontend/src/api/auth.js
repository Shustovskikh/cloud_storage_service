import axios from 'axios';
import { toast } from 'react-toastify';
import { login as reduxLogin, logout as reduxLogout } from '../authSlice';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
});

api.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      toast.error('Access denied. Please log in again', {
        autoClose: 3000,
        hideProgressBar: true,
        toastId: 'forbidden-error'
      });
      await new Promise(resolve => setTimeout(resolve, 3000));
      handleGlobalLogout();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && 
        error.response.data?.detail === 'Given token not valid for any token type' &&
        !originalRequest._retry) {
      originalRequest._retry = true;
      toast.error('Session expired. Redirecting to login...', {
        autoClose: 3000,
        hideProgressBar: true,
        toastId: 'session-expired'
      });
      await new Promise(resolve => setTimeout(resolve, 3000));
      handleGlobalLogout();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && 
        error.config.url.includes('/token/refresh')) {
      handleGlobalLogout();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

const handleGlobalLogout = () => {
  const store = require('../store').default;
  store.dispatch(reduxLogout());
  window.location.href = '/login';
};

export const login = async (username, password) => {
  try {
    const response = await api.post('/token/', { username, password }, {
      withCredentials: true
    });
    
    return { 
      success: true, 
      is_staff: response.data.is_staff 
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || 'Login failed. Please check your credentials',
    };
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/users/register/', userData, {
      withCredentials: true
    });
    return { 
      success: true, 
      data: response.data 
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || 'Registration failed. Please try again',
    };
  }
};

export const refreshAccessToken = async (dispatch) => {
  try {
    const response = await api.post('/token/refresh/', {}, {
      withCredentials: true
    });
    
    dispatch(reduxLogin({
      user: JSON.parse(localStorage.getItem('user')) || null,
    }));
    
    return { success: true };
  } catch (error) {
    handleGlobalLogout();
    return { 
      success: false, 
      message: 'Failed to refresh token. Please log in again' 
    };
  }
};

export const logout = async (dispatch) => {
  try {
    await api.post('/users/logout/', {}, {
      withCredentials: true
    });
  } finally {
    handleGlobalLogout();
  }
};

export { api };