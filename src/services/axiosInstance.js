import axios from 'axios';
// import Cookies from 'js-cookie'; // Commented out as getCsrfToken will be removed

// Function to get CSRF token - This function will become unused
// export const getCsrfToken = () => {
//   return Cookies.get('XSRF-TOKEN');
// };

// Base Axios instance
export const baseApiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Explicitly set the base URL
  withCredentials: false,
});

// REMOVE or COMMENT OUT the XSRF interceptor:
/*
baseApiClient.interceptors.request.use(
  (config) => {
    const csrfToken = getCsrfToken(); // getCsrfToken would be from the commented out function
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
*/

export default baseApiClient;
