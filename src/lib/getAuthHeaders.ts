import { getCookie } from './clientCookies';

// Get authorization header
export const getAuthHeaders = () => {
  const token = getCookie('token');

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};
