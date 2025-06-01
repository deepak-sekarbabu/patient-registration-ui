// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
import { baseApiClient } from './axiosInstance';

// Create a secure API client
const genericApiClient = baseApiClient;

// Add response interceptor for handling auth errors
genericApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If unauthorized and there's a window object, redirect to login
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // This will trigger the auth context to handle the session expiry
      window.dispatchEvent(new CustomEvent('auth:sessionExpired'));

      // Modify the error message to ensure consistent error handling
      if (error.config?.url?.includes('/auth/login')) {
        error.message = 'Unauthorized: Invalid phone number or password';
      }
    }
    return Promise.reject(error);
  }
);

// Export the API client for other services to use
export { genericApiClient };
