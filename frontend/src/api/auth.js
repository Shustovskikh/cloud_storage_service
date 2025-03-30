import axios from 'axios';
import { toast } from 'react-toastify';
import { setToken, removeTokens } from '../utils/helpers';
import { login as reduxLogin, logout as reduxLogout } from '../authSlice';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
  removeTokens();
  const store = require('../store').default;
  store.dispatch(reduxLogout());
  window.location.href = '/login';
};

export const login = async (username, password) => {
  try {
    const response = await api.post('/token/', { username, password });
    const { access, refresh, is_staff } = response.data;
    setToken(access, refresh);
    return { 
      success: true, 
      access, 
      refresh, 
      is_staff 
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
    const response = await api.post('/users/register/', userData);
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
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    return { 
      success: false, 
      message: 'No refresh token available' 
    };
  }

  try {
    const response = await api.post('/token/refresh/', { refresh: refreshToken });
    const { access } = response.data;
    
    setToken(access, refreshToken);
    dispatch(reduxLogin({
      user: JSON.parse(localStorage.getItem('user')) || null,
      tokens: { access, refresh: refreshToken },
    }));
    
    return { success: true, access };
  } catch (error) {
    handleGlobalLogout();
    return { 
      success: false, 
      message: 'Failed to refresh token. Please log in again' 
    };
  }
};

export const logout = (dispatch) => {
  handleGlobalLogout();
};

export { api };