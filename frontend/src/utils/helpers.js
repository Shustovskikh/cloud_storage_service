export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const getToken = () => localStorage.getItem('accessToken');

export const setToken = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};

export const removeTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const getAuthHeader = () => ({
  Authorization: `Bearer ${getToken()}`,
});
