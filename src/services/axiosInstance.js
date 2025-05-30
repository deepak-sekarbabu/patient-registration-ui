import axios from 'axios';
import Cookies from 'js-cookie';

// Function to get CSRF token
export const getCsrfToken = () => {
  return Cookies.get('XSRF-TOKEN');
};

// Base Axios instance
export const baseApiClient = axios.create({
  baseURL: 'http://localhost:8080/v1/api',
  withCredentials: true,
});

// Add a request interceptor to include CSRF token
baseApiClient.interceptors.request.use(
  (config) => {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default baseApiClient;
