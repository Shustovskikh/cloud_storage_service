import { createSlice } from '@reduxjs/toolkit';

const safeParse = (key, defaultValue) => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const initialState = {
  user: safeParse('user', null),
  tokens: {
    access: localStorage.getItem('accessToken'),
    refresh: localStorage.getItem('refreshToken'),
  },
  isAdmin: safeParse('user', {}).is_staff || false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      const { user, tokens } = action.payload;
      state.user = user;
      state.tokens = tokens;
      state.isAdmin = user.is_staff || false;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
    },
    logout(state) {
      state.user = null;
      state.tokens = { access: null, refresh: null };
      state.isAdmin = false;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
