import axios from 'axios';

// Base Axios instance
export const baseApiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Explicitly set the base URL
  withCredentials: false,
  timeout: 30000, // 30 seconds timeout
});


export default baseApiClient;
