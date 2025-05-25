import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:8080/v1/api';

// Create a secure API client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
});

// Function to get CSRF token from cookies
const getCsrfToken = () => {
  return Cookies.get('XSRF-TOKEN');
};

// Add CSRF token and Auth tokens to all requests
apiClient.interceptors.request.use((config) => {
  // Add CSRF token if available
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }

  return config;
});

// Add response interceptor for handling auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If unauthorized and there's a window object, redirect to login
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // This will trigger the auth context to handle the session expiry
      window.dispatchEvent(new CustomEvent('auth:sessionExpired'));

      // Modify the error message to ensure consistent error handling
      if (error.config?.url?.includes('/patients/login')) {
        error.message = 'Unauthorized: Invalid phone number or password';
      }
    }
    return Promise.reject(error);
  }
);

// ===================== DEPRECATED PATIENT METHODS =====================
// The following methods are deprecated and will be removed in a future release.
// Please use corresponding methods from authService instead.
// =======================================================================

const patientService = {
  /**
   * Register a new patient - DEPRECATED: Use authService.register() instead
   * @deprecated
   * @param {Object} patientData - The patient registration data
   * @returns {Promise} - The API response
   */
  registerPatient: async (patientData) => {
    try {
      const response = await apiClient.post(`/patients`, patientData);
      return response.data;
    } catch (error) {
      console.error('Error registering patient:', error);
      throw error;
    }
  },

  /**
   * Login patient - DEPRECATED: Use authService.login() instead
   * @deprecated
   * @param {string} phone
   * @param {string} password
   * @returns {Promise<Object>} The patient data with token
   */
  login: async (phone, password) => {
    try {
      const response = await apiClient.post(`/patients/login`, {
        phoneNumber: phone,
        password: password,
      });
      return response.data;
    } catch (error) {
      console.error('API login error:', error);
      throw error;
    }
  },

  /**
   * Login patient - DEPRECATED: Use authService.login() instead
   * @deprecated
   * @param {string} phone
   * @param {string} password
   * @returns {Promise<Object>} The patient data with token
   */
  loginPatient: async (phone, password) => {
    try {
      const response = await apiClient.post(`/patients/login`, {
        phoneNumber: phone,
        password: password,
      });
      return response.data;
    } catch (error) {
      console.error('Error logging in patient:', error);
      throw new Error('Invalid phone number or password');
    }
  },

  /**
   * Update patient info - DEPRECATED: Use authService.updatePatient() instead
   * @deprecated
   * @param {string} token
   * @param {object} updatedData
   * @returns {Promise<object>}
   */
  updatePatient: async (token, updatedData) => {
    try {
      const response = await apiClient.put(`/patients/${updatedData.id}`, updatedData);
      return response.data;
    } catch (error) {
      console.error('Error updating patient information:', error);
      throw error;
    }
  },

  /**
   * Check if a patient exists by phone number
   * @param {string} phoneNumber - The phone number to check
   * @returns {Promise<boolean>} - Whether the patient exists
   */
  checkPhoneExists: async (phoneNumber) => {
    try {
      const response = await apiClient.get(`/patients/exists-by-phone?phoneNumber=${phoneNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error checking phone number existence:', error);
      throw error;
    }
  },

  /**
   * Change patient password - DEPRECATED: Use authService.changePassword() instead
   * @deprecated
   * @param {string} id - Patient ID
   * @param {string} newPassword
   * @param {string} token (optional, for auth header)
   * @returns {Promise<void>}
   */
  changePassword: async (id, newPassword) => {
    try {
      await apiClient.post(`/patients/${id}/password`, { newPassword });
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },
};

// Export the API client for other services to use
export { apiClient };

export default patientService;
