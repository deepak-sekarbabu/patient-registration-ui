import axios from 'axios';
// import Cookies from 'js-cookie'; // Commented out as getCsrfToken will be removed

// Function to get CSRF token - This function will become unused
// export const getCsrfToken = () => {
//   return Cookies.get('XSRF-TOKEN');
// };

// Base Axios instance
export const baseApiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8081/api',
  // Setting withCredentials to false as Bearer tokens are used for auth,
  // and cookies are not strictly necessary for the primary authentication mechanism.
  // If any specific endpoint (e.g., a legacy refresh mechanism not following Bearer patterns)
  // still relies on cookies, this might need adjustment or a separate Axios instance for that endpoint.
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
