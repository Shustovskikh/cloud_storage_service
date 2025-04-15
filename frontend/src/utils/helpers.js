
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const getUsername = () => localStorage.getItem('username');

export const setUsername = (username) => {
  if (username) localStorage.setItem('username', username);
};

export const clearUserData = () => {
  localStorage.removeItem('username');
};

export const isAuthenticated = async () => {
  console.warn('The IsAuthenticated() method is deprecated. Use API verification');
  return false;
};