import { createSlice } from '@reduxjs/toolkit';

const loadFromLocalStorage = (key, defaultValue) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const initialState = {
  user: loadFromLocalStorage('user', null),
  tokens: {
    access: localStorage.getItem('accessToken'),
    refresh: localStorage.getItem('refreshToken'),
  },
  isAdmin: loadFromLocalStorage('user', null)?.is_staff || false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { user, tokens } = action.payload;
      state.user = user;
      state.tokens = tokens;
      state.isAdmin = user?.is_staff || false;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
    },
    logout: (state) => {
      state.user = null;
      state.tokens = { access: null, refresh: null };
      state.isAdmin = false;
      localStorage.clear();
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;