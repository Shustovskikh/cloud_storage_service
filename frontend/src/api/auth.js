import axios from 'axios';
import { setToken, removeTokens } from '../utils/helpers';
import { login as reduxLogin, logout as reduxLogout } from '../authSlice';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/token/`, { username, password });
    const { access, refresh, is_staff } = response.data;

    setToken(access, refresh);

    return { success: true, access, refresh, is_staff };
  } catch (error) {
    console.error('Login error:', error);

    return {
      success: false,
      message: error.response?.data?.detail || 'Login failed. Please check your credentials.',
    };
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users/register/`, userData);

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Registration error:', error);

    return {
      success: false,
      message: error.response?.data || 'Registration failed. Please try again later.',
    };
  }
};

export const refreshAccessToken = async (dispatch) => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    console.warn('No refresh token available');
    return { success: false, message: 'No refresh token available' };
  }

  try {
    const response = await axios.post(`${API_URL}/token/refresh/`, { refresh: refreshToken });
    const { access } = response.data;

    setToken(access, refreshToken);
    dispatch(
      reduxLogin({
        user: JSON.parse(localStorage.getItem('user')),
        tokens: { access, refresh: refreshToken },
      })
    );

    return { success: true, access };
  } catch (error) {
    console.error('Token refresh error:', error);

    removeTokens();
    dispatch(reduxLogout());

    return { success: false, message: 'Token refresh failed. Please log in again.' };
  }
};

export const logout = (dispatch) => {
  removeTokens();
  dispatch(reduxLogout());
};
